import { mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { FullConfig, FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { convertToMp4 } from './video.js';

export interface RunJudgment {
  claim: string;
  probability: number;
  passed: boolean;
  threshold: number;
  url: string;
  apiMs?: number;
  inputTokens?: number;
  /** Path relative to artifacts/ of the screenshot taken at judgment time. */
  screenshot?: string;
}

export interface RunGoal {
  goal: string;
  status: string;
  steps: { step: number; url: string; action: string; probability: number; apiMs: number }[];
}

export interface RunTest {
  id: string;
  file: string;
  title: string;
  status: string;
  durationMs: number;
  error?: string;
  /** Paths relative to artifacts/. */
  video?: string;
  trace?: string;
  failureScreenshot?: string;
  judgments: RunJudgment[];
  goals: RunGoal[];
}

export interface RunRecord {
  runId: string;
  startedAt: string;
  finishedAt: string;
  baseUrl: string;
  status: string;
  counts: { passed: number; failed: number; skipped: number; total: number };
  jev: { calls: number; inputTokens: number; apiMs: number };
  tests: RunTest[];
}

const ARTIFACTS_DIR = 'artifacts';
const RUNS_DIR = join(ARTIFACTS_DIR, 'runs');

/**
 * Persists one JSON record per run under artifacts/runs/ (read by the dashboard)
 * plus a human summary in artifacts/summary.md. Judgment screenshots, which
 * only exist as in-memory attachments, are written next to the run record.
 */
export default class JevReporter implements Reporter {
  private runId = new Date().toISOString().replace(/[:.]/g, '-');
  private startedAt = new Date().toISOString();
  private baseUrl = '';
  private tests: RunTest[] = [];

  onBegin(config: FullConfig) {
    this.baseUrl = String(config.projects[0]?.use.baseURL ?? '');
    mkdirSync(join(RUNS_DIR, this.runId), { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const row: RunTest = {
      id: test.id,
      file: relative(process.cwd(), test.location.file).replace(/^tests\//, ''),
      title: test.titlePath().slice(3).join(' › '),
      status: result.status,
      durationMs: result.duration,
      error: result.error?.message?.split('\n')[0],
      judgments: [],
      goals: [],
    };
    let shot = 0;
    for (const attachment of result.attachments) {
      if (attachment.path) {
        const rel = relative(ARTIFACTS_DIR, attachment.path);
        if (attachment.name === 'video') row.video = rel;
        if (attachment.name === 'trace') row.trace = rel;
        if (attachment.name === 'screenshot') row.failureScreenshot = rel;
        continue;
      }
      if (!attachment.body) continue;
      if (attachment.name.startsWith('jev-judgment:')) {
        row.judgments.push(JSON.parse(attachment.body.toString()));
      } else if (attachment.name.startsWith('screenshot:')) {
        const file = join(RUNS_DIR, this.runId, `${test.id.replace(/[^a-z0-9]/gi, '_')}-${shot++}.png`);
        writeFileSync(file, attachment.body);
        const judgment = row.judgments.at(-1);
        if (judgment) judgment.screenshot = relative(ARTIFACTS_DIR, file);
      } else if (attachment.name.startsWith('jev-goal:')) {
        const g = JSON.parse(attachment.body.toString());
        row.goals.push({ goal: attachment.name.replace('jev-goal: ', ''), status: g.status, steps: g.steps });
      }
    }
    this.tests.push(row);
  }

  onEnd(result: FullResult) {
    for (const t of this.tests) {
      if (!t.video) continue;
      const mp4 = convertToMp4(join(ARTIFACTS_DIR, t.video));
      if (mp4) t.video = relative(ARTIFACTS_DIR, mp4);
    }
    const counts = { passed: 0, failed: 0, skipped: 0, total: this.tests.length };
    for (const t of this.tests) {
      if (t.status === 'passed') counts.passed += 1;
      else if (t.status === 'skipped') counts.skipped += 1;
      else counts.failed += 1;
    }
    const jev = { calls: 0, inputTokens: 0, apiMs: 0 };
    for (const t of this.tests) {
      for (const j of t.judgments) {
        jev.calls += 1;
        jev.inputTokens += j.inputTokens ?? 0;
        jev.apiMs += j.apiMs ?? 0;
      }
      for (const g of t.goals) {
        for (const s of g.steps) {
          jev.calls += 1;
          jev.apiMs += s.apiMs;
        }
      }
    }
    const record: RunRecord = {
      runId: this.runId,
      startedAt: this.startedAt,
      finishedAt: new Date().toISOString(),
      baseUrl: this.baseUrl,
      status: result.status,
      counts,
      jev,
      tests: this.tests,
    };
    writeFileSync(join(RUNS_DIR, `${this.runId}.json`), JSON.stringify(record, null, 2));
    writeFileSync(join(ARTIFACTS_DIR, 'summary.md'), renderMarkdown(record));
  }
}

function renderMarkdown(run: RunRecord): string {
  const lines = [
    '# QA run summary',
    '',
    `Run ${run.runId} against ${run.baseUrl}: **${run.status}** (${run.counts.passed} passed, ${run.counts.failed} failed, ${run.counts.skipped} skipped)`,
    '',
  ];
  for (const t of run.tests) {
    lines.push(`## ${t.status === 'passed' ? '✅' : t.status === 'skipped' ? '⏭' : '❌'} ${t.file} › ${t.title} (${Math.round(t.durationMs / 1000)}s)`);
    if (t.error) lines.push(`- Error: ${t.error}`);
    if (t.video) lines.push(`- Video: \`artifacts/${t.video}\``);
    for (const j of t.judgments) lines.push(`- ${j.passed ? 'PASS' : 'FAIL'} p=${j.probability.toFixed(2)} — ${j.claim}`);
    for (const g of t.goals) lines.push(`- goal "${g.goal}" → ${g.status} in ${g.steps.length} step(s)`);
    lines.push('');
  }
  return lines.join('\n');
}

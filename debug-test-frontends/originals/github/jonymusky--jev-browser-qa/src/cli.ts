#!/usr/bin/env node
import 'dotenv/config';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium, type Page } from '@playwright/test';
import { expectPage, judge, jevCallLog, pick, runGoal, setEvidenceSink } from './jev/index.js';
import type { RunRecord, RunTest } from './jevReporter.js';
import { convertToMp4 } from './video.js';
import { describeStep, substituteEnv, type Flow, type FlowResult, type FlowStep, type StepResult } from './flow.js';

const USAGE = `jev-qa — run a browser QA flow judged by Jev, recorded on video.

Usage:
  pnpm qa run <flow.json> [--headed] [--json] [--base-url <url>]
  pnpm qa run --steps '<json array>' --name <flow-name> [--json]
  pnpm qa steps            # prints the step schema

Output: a JSON result on stdout (--json: nothing else on stdout). Exit code 0 on pass, 1 on fail, 2 on usage error.
`;

const STEP_SCHEMA = `Steps (one key per step, \${ENV_VAR} substitution in strings):
  {"goto": "/auth/login"}
  {"fill": "#email", "value": "\${QA_EMAIL}"}
  {"press": "#email", "key": "Enter"}
  {"clickSelector": "button[type=submit]"}
  {"click": "the sign in button"}                       Jev picks the control by intent
  {"expect": "The user is signed in", "threshold": 0.7, "criteria": {"true": "...", "false": "..."}}
  {"goal": "Open the settings screen", "maxSteps": 8, "denyNames": ["cerrar sesi", "delete"]}
  {"waitForUrl": "!/auth/login", "timeoutMs": 30000}    prefix ! = wait until the URL does NOT contain it
  {"waitForSelector": "#password"}
  {"wait": 1500}
  {"screenshot": "after-login"}
`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      headed: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      steps: { type: 'string' },
      name: { type: 'string' },
      'base-url': { type: 'string' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  const [command, flowPath] = positionals;
  if (values.help || !command) return exit(USAGE, 2);
  if (command === 'steps') return exit(STEP_SCHEMA, 0);
  if (command !== 'run') return exit(USAGE, 2);

  let flow: Flow;
  if (values.steps) {
    flow = { name: values.name ?? 'inline', steps: JSON.parse(values.steps) };
  } else if (flowPath && existsSync(flowPath)) {
    flow = JSON.parse(readFileSync(flowPath, 'utf8'));
  } else {
    return exit(`Flow file not found. ${USAGE}`, 2);
  }
  const baseUrl = values['base-url'] ?? flow.baseUrl ?? process.env.BASE_URL ?? 'http://localhost:3000';
  const result = await runFlow(flow, { baseUrl, headed: values.headed, quiet: values.json });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.status === 'passed' ? 0 : 1);
}

function exit(message: string, code: number): never {
  (code === 0 ? process.stdout : process.stderr).write(message);
  process.exit(code);
}

async function runFlow(flow: Flow, opts: { baseUrl: string; headed: boolean; quiet: boolean }): Promise<FlowResult> {
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = resolve('artifacts', 'flows', runId);
  mkdirSync(outDir, { recursive: true });
  const log = (line: string) => {
    if (!opts.quiet) process.stderr.write(`${line}\n`);
  };

  const test: RunTest = { id: runId, file: 'cli', title: flow.name, status: 'passed', durationMs: 0, judgments: [], goals: [] };
  let shot = 0;
  setEvidenceSink(async (name, body, contentType) => {
    if (name.startsWith('jev-judgment:')) test.judgments.push(JSON.parse(body.toString()));
    else if (name.startsWith('jev-goal:')) {
      const g = JSON.parse(body.toString());
      test.goals.push({ goal: name.replace('jev-goal: ', ''), status: g.status, steps: g.steps });
    } else if (contentType === 'image/png') {
      const file = join(outDir, `judgment-${shot++}.png`);
      writeFileSync(file, body);
      const j = test.judgments.at(-1);
      if (j) j.screenshot = `flows/${runId}/judgment-${shot - 1}.png`;
    }
  });

  const browser = await chromium.launch({ headless: !opts.headed });
  const context = await browser.newContext({
    baseURL: opts.baseUrl,
    viewport: { width: 1280, height: 800 },
    locale: 'es-AR',
    recordVideo: { dir: outDir, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();
  const startedAt = new Date();
  const steps: StepResult[] = [];
  let status: FlowResult['status'] = 'passed';

  for (const [index, step] of flow.steps.entries()) {
    const t0 = performance.now();
    const label = describeStep(step);
    log(`[${index + 1}/${flow.steps.length}] ${label}`);
    const entry: StepResult = { index, step, status: 'passed', ms: 0 };
    try {
      Object.assign(entry, await executeStep(page, step, log));
    } catch (error) {
      entry.status = 'failed';
      entry.error = error instanceof Error ? error.message.split('\n')[0] : String(error);
      status = 'failed';
    }
    entry.ms = Math.round(performance.now() - t0);
    entry.url = page.url();
    steps.push(entry);
    log(`    ${entry.status}${entry.probability !== undefined ? ` p=${entry.probability.toFixed(2)}` : ''}${entry.error ? ` — ${entry.error}` : ''} (${entry.ms} ms)`);
    if (entry.status === 'failed') {
      for (let rest = index + 1; rest < flow.steps.length; rest += 1) {
        steps.push({ index: rest, step: flow.steps[rest], status: 'skipped', ms: 0 });
      }
      break;
    }
  }

  const finalScreenshot = join(outDir, 'final.png');
  await page.screenshot({ path: finalScreenshot, fullPage: false }).catch(() => undefined);
  const finalUrl = page.url();
  const rawVideo = await page.video()?.path();
  await context.close();
  await browser.close();
  let video: string | undefined;
  if (rawVideo && existsSync(rawVideo)) {
    const webm = join(outDir, 'video.webm');
    renameSync(rawVideo, webm);
    // MP4 when a system ffmpeg is available (Safari cannot play WebM); WebM otherwise.
    video = convertToMp4(webm) ?? webm;
  }

  const finishedAt = new Date();
  const jev = jevCallLog.reduce(
    (acc, c) => ({ calls: acc.calls + 1, inputTokens: acc.inputTokens + (c.inputTokens ?? 0), apiMs: acc.apiMs + c.apiMs }),
    { calls: 0, inputTokens: 0, apiMs: 0 },
  );
  const result: FlowResult = {
    runId,
    flow: flow.name,
    baseUrl: opts.baseUrl,
    status,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    finalUrl,
    video,
    finalScreenshot: existsSync(finalScreenshot) ? finalScreenshot : undefined,
    steps,
    jev,
  };
  writeFileSync(join(outDir, 'result.json'), JSON.stringify(result, null, 2));
  recordForDashboard(result, test);
  return result;
}

async function executeStep(page: Page, step: FlowStep, log: (line: string) => void): Promise<Partial<StepResult>> {
  if ('goto' in step) {
    await page.goto(substituteEnv(step.goto));
    await page.waitForLoadState('networkidle').catch(() => undefined);
    return {};
  }
  if ('fill' in step) {
    await page.locator(substituteEnv(step.fill)).first().fill(substituteEnv(step.value));
    return {};
  }
  if ('press' in step) {
    await page.locator(substituteEnv(step.press)).first().press(step.key);
    return {};
  }
  if ('clickSelector' in step) {
    await page.locator(substituteEnv(step.clickSelector)).first().click();
    await page.waitForLoadState('networkidle').catch(() => undefined);
    return {};
  }
  if ('click' in step) {
    const picked = await pick(page, substituteEnv(step.click), { minConfidence: step.minConfidence });
    log(`    Jev picked ${picked.control.role} "${picked.control.name}" p=${picked.probability.toFixed(2)}`);
    await picked.locator.click();
    await page.waitForLoadState('networkidle').catch(() => undefined);
    return { probability: picked.probability };
  }
  if ('expect' in step) {
    const judgment = await judge(page, substituteEnv(step.expect), { threshold: step.threshold, criteria: step.criteria });
    if (!judgment.passed) {
      throw new Error(`Jev judged "${judgment.claim}" as ${judgment.probability.toFixed(2)} (threshold ${judgment.threshold})`);
    }
    return { probability: judgment.probability };
  }
  if ('goal' in step) {
    const outcome = await runGoal(page, {
      goal: substituteEnv(step.goal),
      maxSteps: step.maxSteps,
      policy: {
        denyNames: step.denyNames?.map((s) => new RegExp(s, 'i')),
        allowNames: step.allowNames?.map((s) => new RegExp(s, 'i')),
      },
    });
    for (const s of outcome.steps) log(`    step ${s.step}: ${s.action} p=${s.probability.toFixed(2)}`);
    if (outcome.status !== 'done') throw new Error(`goal ended with status ${outcome.status}`);
    return { goalStatus: outcome.status };
  }
  if ('waitForUrl' in step) {
    const target = substituteEnv(step.waitForUrl);
    const negate = target.startsWith('!');
    const needle = negate ? target.slice(1) : target;
    await page.waitForURL((url) => url.href.includes(needle) !== negate, { timeout: step.timeoutMs ?? 30_000 });
    await page.waitForLoadState('networkidle').catch(() => undefined);
    return {};
  }
  if ('waitForSelector' in step) {
    await page.locator(substituteEnv(step.waitForSelector)).first().waitFor({ state: 'visible', timeout: step.timeoutMs ?? 15_000 });
    return {};
  }
  if ('wait' in step) {
    await page.waitForTimeout(step.wait);
    return {};
  }
  if ('screenshot' in step) {
    const dir = resolve('artifacts', 'flows');
    await page.screenshot({ path: join(dir, `${step.screenshot}.png`) });
    return {};
  }
  throw new Error(`Unknown step: ${JSON.stringify(step)}`);
}

/** Appends the flow to artifacts/runs so the dashboard lists it alongside test-runner runs. */
function recordForDashboard(result: FlowResult, test: RunTest) {
  const runsDir = resolve('artifacts', 'runs');
  mkdirSync(runsDir, { recursive: true });
  test.status = result.status;
  test.durationMs = result.durationMs;
  test.error = result.steps.find((s) => s.status === 'failed')?.error;
  test.video = result.video ? `flows/${result.runId}/${basename(result.video)}` : undefined;
  test.failureScreenshot = result.status === 'failed' && result.finalScreenshot ? `flows/${result.runId}/final.png` : undefined;
  const record: RunRecord = {
    runId: result.runId,
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    baseUrl: result.baseUrl,
    status: result.status,
    counts: { passed: result.status === 'passed' ? 1 : 0, failed: result.status === 'failed' ? 1 : 0, skipped: 0, total: 1 },
    jev: result.jev,
    tests: [test],
  };
  writeFileSync(join(runsDir, `${result.runId}.json`), JSON.stringify(record, null, 2));
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(2);
});

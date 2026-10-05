import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { satisfies } from "eve/evals/expect";
import type { EveEvalContext, EveEvalTurn } from "eve/evals";
import { MODE } from "../agent/mode";
import { resolvePreset } from "../agent/lib/models";
import type { BenchmarkPrompt } from "./prompts";


export interface RunRecord {
  readonly mode: string;
  readonly modelKey: string;
  readonly modelLabel: string;
  readonly promptId: string;
  readonly title: string;
  readonly tier: string;
  readonly prompt: string;
  readonly sessionId: string;
  readonly at: string;
  readonly modelId: string | null;
  readonly status: string;
  readonly succeeded: boolean;
  readonly modelSteps: number;
  readonly toolCalls: number;
  readonly failedToolCalls: number;
  readonly jevCalls: number;
  readonly idealToolCalls: number;
  readonly extraToolCalls: number;
  readonly distractorCalls: number;
  readonly distractorTools: readonly string[];
  readonly toolCategories: Record<string, number>;
  readonly idealPath: boolean;
  readonly efficiency: number;
  readonly requiredCovered: number;
  readonly requiredTotal: number;
  readonly completion: number;
  readonly durationMs: number;
  readonly usage: { inputTokens: number; outputTokens: number; cacheReadTokens: number; costUsd: number; estimatedCostUsd: number };
  readonly reasoningChars: number;
  readonly reply: string | null;
  readonly timeline: TimelineEntry[];
}

export interface TimelineEntry {
  readonly step: number;
  readonly kind: "model" | "tool" | "jev" | "message";
  readonly name: string;
  readonly detail?: unknown;
  readonly ok?: boolean;
  readonly confidence?: number;
  readonly done?: number;
  readonly gated?: boolean;
  readonly latencyMs?: number;
  readonly top?: readonly { name: string; p: number }[];
}

function resultsDir(): string {
  return process.env.EVAL_RESULTS_DIR ?? resolve(process.cwd(), "eval-results");
}

function readJevTrace(sessionId: string) {
  const file = resolve(resultsDir(), "jev-trace.jsonl");
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l) as Record<string, unknown>;
      } catch {
        return null;
      }
    })
    .filter((r): r is Record<string, unknown> => !!r && r.kind === "jev.decision" && r.sessionId === sessionId);
}

function ms(at: string | number | undefined): number | undefined {
  if (at === undefined) return undefined;
  return typeof at === "number" ? at : Date.parse(at);
}

export function summarize(turn: EveEvalTurn, bench: BenchmarkPrompt): RunRecord {
  const events = turn.events as readonly { type: string; data?: unknown; meta?: { at?: string | number } }[];
  const jev = readJevTrace(turn.sessionId);
  const usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, costUsd: 0, estimatedCostUsd: 0 };
  const preset = resolvePreset();
  let modelSteps = 0;
  let reasoningChars = 0;
  let modelId: string | null = null;
  const timeline: TimelineEntry[] = [];
  let first: number | undefined;
  let last: number | undefined;

  for (const e of events) {
    const at = ms(e.meta?.at);
    if (at !== undefined) {
      first = first === undefined ? at : Math.min(first, at);
      last = last === undefined ? at : Math.max(last, at);
    }
    const data = (e.data ?? {}) as Record<string, unknown>;
    switch (e.type) {
      case "step.started": {
        modelSteps += 1;
        modelId = (data.modelId as string) ?? modelId;
        const stepIndex = data.stepIndex as number;
        const decision = jev.find((j) => j.stepIndex === stepIndex);
        if (decision) {
          timeline.push({ step: stepIndex, kind: "jev", name: String(decision.tool), confidence: decision.confidence as number, done: decision.done as number | undefined, gated: Boolean(decision.gated), latencyMs: decision.latencyMs as number, top: decision.top as { name: string; p: number }[] });
        }
        timeline.push({ step: stepIndex, kind: "model", name: modelId ?? "model" });
        break;
      }
      case "step.completed": {
        const u = (data.usage ?? {}) as Record<string, number | undefined>;
        usage.inputTokens += u.inputTokens ?? 0;
        usage.outputTokens += u.outputTokens ?? 0;
        usage.cacheReadTokens += u.cacheReadTokens ?? 0;
        usage.costUsd += u.costUsd ?? 0;
        break;
      }
      case "reasoning.completed":
        reasoningChars += ((data.reasoning as string) ?? "").length;
        break;
      case "actions.requested": {
        const actions = (data.actions ?? []) as Record<string, unknown>[];
        for (const a of actions) {
          if (a.kind === "tool-call") {
            timeline.push({ step: data.stepIndex as number, kind: "tool", name: String(a.toolName), detail: a.input });
          }
        }
        break;
      }
      case "message.completed": {
        const text = data.message as string | null;
        if (text && data.finishReason !== "tool-calls") {
          timeline.push({ step: data.stepIndex as number, kind: "message", name: "assistant", detail: text.slice(0, 400) });
        }
        break;
      }
      default:
        break;
    }
  }

  // Mark tool outcomes from the joined tool calls.
  const failed = turn.toolCalls.filter((c) => c.status !== "completed").length;
  for (const entry of timeline) {
    if (entry.kind === "tool") {
      const call = turn.toolCalls.find((c) => c.name === entry.name && JSON.stringify(c.input) === JSON.stringify(entry.detail));
      (entry as { ok?: boolean }).ok = call ? call.status === "completed" : undefined;
    }
  }

  const called = new Set(turn.toolCalls.filter((c) => c.status === "completed").map((c) => c.name));
  const covered = bench.required.filter((family) => family.some((name) => called.has(name))).length;
  const distractorSet = new Set(bench.distractors);
  const distractorTools = turn.toolCalls.map((c) => c.name).filter((n) => distractorSet.has(n));
  const toolCategories: Record<string, number> = {};
  for (const c of turn.toolCalls) {
    const cat = c.name.split("_")[0] ?? "other";
    toolCategories[cat] = (toolCategories[cat] ?? 0) + 1;
  }
  usage.estimatedCostUsd = (usage.inputTokens * preset.pricing.input + usage.outputTokens * preset.pricing.output) / 1_000_000;
  const completion = bench.required.length ? covered / bench.required.length : 1;
  const extra = Math.max(0, turn.toolCalls.length - bench.idealToolCalls);
  // 0..1: full completion on the ideal path with no wrong tools = 1.
  const efficiency = completion * (bench.idealToolCalls / Math.max(turn.toolCalls.length, bench.idealToolCalls)) * (distractorTools.length ? 0.5 : 1);

  return {
    mode: MODE,
    modelKey: preset.key,
    modelLabel: preset.label,
    promptId: bench.id,
    title: bench.title,
    tier: bench.tier,
    prompt: bench.prompt,
    sessionId: turn.sessionId,
    at: new Date().toISOString(),
    modelId,
    status: turn.status,
    succeeded: turn.status !== "failed",
    modelSteps,
    toolCalls: turn.toolCalls.length,
    failedToolCalls: failed,
    jevCalls: jev.length,
    idealToolCalls: bench.idealToolCalls,
    extraToolCalls: extra,
    distractorCalls: distractorTools.length,
    distractorTools,
    toolCategories,
    idealPath: completion === 1 && extra === 0 && distractorTools.length === 0 && failed === 0,
    efficiency,
    requiredCovered: covered,
    requiredTotal: bench.required.length,
    completion,
    durationMs: first !== undefined && last !== undefined ? last - first : 0,
    usage,
    reasoningChars,
    reply: turn.message ?? null,
    timeline,
  };
}

export function persist(record: RunRecord): string {
  const dir = resolve(resultsDir(), record.mode, record.modelKey);
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `${record.promptId}.json`);
  writeFileSync(file, JSON.stringify(record, null, 2));
  appendFileSync(resolve(dir, "history.jsonl"), `${JSON.stringify(record)}\n`);
  return file;
}

/** Drive one benchmark prompt, record metrics, and register soft assertions. */
export async function runBenchmark(t: EveEvalContext, bench: BenchmarkPrompt): Promise<RunRecord> {
  const turn = await t.send(bench.prompt);
  const record = summarize(turn, bench);
  const file = persist(record);
  t.log(`[${record.mode}/${record.modelKey}] ${bench.id}: steps=${record.modelSteps} tools=${record.toolCalls} jev=${record.jevCalls} wrong=${record.distractorCalls} completion=${record.completion.toFixed(2)} -> ${file}`);

  t.succeeded();
  t.check(record.completion, satisfies((v) => (v as number) >= 1, "all required tool families were called")).label("completion").soft(1);
  t.check(record.toolCalls, satisfies((v) => (v as number) <= bench.idealToolCalls + 2, "no more than ideal+2 tool calls")).label("tool-efficiency").soft();
  t.check(record.distractorCalls, satisfies((v) => (v as number) === 0, "no similarly-named wrong tool was called")).label("no-wrong-tool").soft(1);
  return record;
}

import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Append-only JSONL trace of router decisions. The eval harness joins these
 * lines with the eve event stream by session id to show, per model step, what
 * Jev chose, with what confidence, and how long the classifier call took.
 */
export function traceFile(): string {
  return (
    process.env.JEV_TRACE_FILE ??
    resolve(process.env.EVAL_RESULTS_DIR ?? resolve(process.cwd(), "eval-results"), "jev-trace.jsonl")
  );
}

export function trace(record: Record<string, unknown>): void {
  try {
    const file = traceFile();
    mkdirSync(dirname(file), { recursive: true });
    appendFileSync(file, `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`);
  } catch (error) {
    console.warn("[trace] failed to write", error);
  }
}

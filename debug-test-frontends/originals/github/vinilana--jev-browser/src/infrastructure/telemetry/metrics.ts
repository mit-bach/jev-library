import type { RunEvent } from '../../domain/ports.js';
import type { ModelMetrics } from '../../domain/types.js';

const MODEL_EVENT = /^(planner|jev|openrouter|eval)\.(start|end|error)$/;

export function modelMetrics(events: RunEvent[]): Record<string, ModelMetrics> {
  const metrics: Record<string, ModelMetrics> = {};
  for (const event of events) {
    const match = MODEL_EVENT.exec(event.type);
    const provider = match?.[1];
    const phase = match?.[2];
    if (!provider || !phase) continue;

    const row = (metrics[provider] ??= emptyMetrics());
    const data = asRecord(event.data);
    if (phase === 'start') row.calls++;
    if (phase === 'error') row.errors++;
    row.durationMs += numberValue(data?.durationMs);

    const output = asRecord(data?.output);
    const usage = asRecord(output?.usage);
    if (!usage) continue;
    row.callsWithUsage++;
    row.inputTokens += numberValue(usage.inputTokens);
    row.outputTokens += numberValue(usage.outputTokens);
  }
  return metrics;
}

function emptyMetrics(): ModelMetrics {
  return {
    calls: 0,
    errors: 0,
    durationMs: 0,
    inputTokens: 0,
    outputTokens: 0,
    callsWithUsage: 0,
  };
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

import { test } from '@playwright/test';

export type EvidenceSink = (name: string, body: Buffer | string, contentType: string) => Promise<void>;

let sink: EvidenceSink | null = null;

/** Routes judgment evidence to a custom collector (used by the CLI) instead of the test runner. */
export function setEvidenceSink(next: EvidenceSink | null) {
  sink = next;
}

/**
 * Attaches evidence to whatever is running: the Playwright test (when inside
 * the runner) or the registered sink. Silently no-ops when neither exists.
 */
export async function attachEvidence(name: string, body: Buffer | string, contentType: string) {
  if (sink) {
    await sink(name, body, contentType);
    return;
  }
  try {
    await test.info().attach(name, { body, contentType });
  } catch {
    // Not inside a Playwright test and no sink registered.
  }
}

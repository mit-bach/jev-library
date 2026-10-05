/**
 * Flow schema executed by the CLI. Steps are deliberately small so an agent can
 * compose them: deterministic Playwright actions plus the three Jev primitives.
 * String values accept ${ENV_VAR} substitution.
 */
export type FlowStep =
  | { goto: string }
  | { fill: string; value: string }
  | { press: string; key: string }
  | { clickSelector: string }
  /** Natural-language click: Jev picks the control. */
  | { click: string; minConfidence?: number }
  /** Natural-language assertion: Jev judges the claim. */
  | { expect: string; threshold?: number; criteria?: { true?: string; false?: string } }
  /** Bounded Jev action loop toward a goal. */
  | { goal: string; maxSteps?: number; denyNames?: string[]; allowNames?: string[] }
  | { waitForUrl: string; timeoutMs?: number }
  | { waitForSelector: string; timeoutMs?: number }
  | { wait: number }
  | { screenshot: string };

export interface Flow {
  name: string;
  baseUrl?: string;
  steps: FlowStep[];
}

export interface StepResult {
  index: number;
  step: FlowStep;
  status: 'passed' | 'failed' | 'skipped';
  ms: number;
  url?: string;
  probability?: number;
  goalStatus?: string;
  error?: string;
}

export interface FlowResult {
  runId: string;
  flow: string;
  baseUrl: string;
  status: 'passed' | 'failed';
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  finalUrl: string;
  /** Absolute paths. */
  video?: string;
  finalScreenshot?: string;
  steps: StepResult[];
  jev: { calls: number; inputTokens: number; apiMs: number };
}

export function substituteEnv(value: string): string {
  return value.replace(/\$\{([A-Z0-9_]+)\}/gi, (_, name: string) => {
    const v = process.env[name];
    if (v === undefined) throw new Error(`Environment variable ${name} is not set`);
    return v;
  });
}

export function describeStep(step: FlowStep): string {
  const [key] = Object.keys(step);
  const value = (step as Record<string, unknown>)[key];
  return `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`;
}

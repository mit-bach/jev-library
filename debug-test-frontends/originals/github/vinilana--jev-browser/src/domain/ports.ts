import type { ExecutableAction, Observation, RunResult, Step, ModelMetrics } from './types.js';

/** A snapshot owns its element references until release. */
export interface BrowserSnapshot {
  observation: Observation;
  execute(action: ExecutableAction): Promise<void>;
  release(): Promise<void>;
}
export interface BrowserPort {
  url(): string;
  navigate(url: string): Promise<void>;
  observe(): Promise<BrowserSnapshot>;
  screenshot(path: string): Promise<void>;
  stopTrace(path: string): Promise<void>;
  close(): Promise<void>;
}
export interface RunEvent {
  seq: number;
  time: string;
  type: string;
  data: unknown;
}
export type EventSink = (type: string, data: unknown) => Promise<void>;
export interface RunTelemetry {
  readonly warnings: string[];
  init(): Promise<void>;
  event: EventSink;
  span<T>(
    name: string,
    input: unknown,
    action: () => Promise<T>,
    observedOutput?: (output: T) => unknown,
  ): Promise<T>;
  capture(
    browser: BrowserPort,
    name: string,
    observation?: Observation,
  ): Promise<Observation | null>;
  json(name: string, value: unknown): Promise<void>;
  recordStep(step: Step): Promise<void>;
  metrics(): Record<string, ModelMetrics>;
  finish(result: RunResult): Promise<void>;
}

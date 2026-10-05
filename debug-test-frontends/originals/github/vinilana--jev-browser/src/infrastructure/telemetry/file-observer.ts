import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Observation } from '../../domain/types.js';
import type { BrowserPort, RunEvent, RunTelemetry } from '../../domain/ports.js';
import type { Step, RunResult } from '../../domain/types.js';
import { modelMetrics } from './metrics.js';
import { renderReport } from '../reporting/html.js';
import { errorMessage } from '../../domain/errors.js';

export class RunObserver implements RunTelemetry {
  readonly events: RunEvent[] = [];
  readonly warnings: string[] = [];
  private queue = Promise.resolve();
  constructor(readonly directory: string) {}

  async init() {
    await mkdir(resolve(this.directory, 'evidence'), { recursive: true });
    await writeFile(resolve(this.directory, 'steps.jsonl'), '');
  }

  async recordStep(step: Step) {
    await appendFile(resolve(this.directory, 'steps.jsonl'), JSON.stringify(step) + '\n');
    await this.event('step', step);
  }

  metrics() {
    return modelMetrics(this.events);
  }

  async finish(result: RunResult) {
    await this.flush();
    await this.json('result.json', result);
    await writeFile(resolve(this.directory, 'report.html'), renderReport(result));
  }

  event(type: string, data: unknown): Promise<void> {
    const event = { seq: this.events.length + 1, time: new Date().toISOString(), type, data };
    this.events.push(event);
    this.queue = this.queue
      .then(() => appendFile(resolve(this.directory, 'events.jsonl'), JSON.stringify(event) + '\n'))
      .catch((error) => {
        this.warnings.push(`events.jsonl: ${errorMessage(error)}`);
      });
    return this.queue;
  }

  async json(name: string, value: unknown) {
    await writeFile(resolve(this.directory, name), JSON.stringify(value, null, 2));
  }

  async span<T>(
    name: string,
    input: unknown,
    action: () => Promise<T>,
    observedOutput?: (output: T) => unknown,
  ): Promise<T> {
    const id = this.events.length + 1;
    await this.event(`${name}.start`, { id, input });
    const start = performance.now();
    try {
      const output = await action();
      await this.event(`${name}.end`, {
        id,
        durationMs: Math.round(performance.now() - start),
        output: observedOutput ? observedOutput(output) : output,
      });
      return output;
    } catch (error) {
      await this.event(`${name}.error`, {
        id,
        durationMs: Math.round(performance.now() - start),
        error: errorMessage(error),
      });
      throw error;
    }
  }

  async capture(
    browser: BrowserPort,
    name: string,
    observation?: Observation,
  ): Promise<Observation | null> {
    let result = observation ?? null;
    try {
      if (!result) {
        const snapshot = await browser.observe();
        try {
          result = snapshot.observation;
        } finally {
          await snapshot.release();
        }
      }
      await this.json(`${name}.observation.json`, result);
    } catch (error) {
      this.warnings.push(`${name} observação: ${errorMessage(error)}`);
    }
    try {
      await browser.screenshot(resolve(this.directory, `${name}.png`));
    } catch (error) {
      this.warnings.push(`${name} screenshot: ${errorMessage(error)}`);
    }
    await this.event('evidence', { name, capturedObservation: result !== null });
    return result;
  }

  async flush() {
    await this.queue;
  }
}

/** Composition root: production adapters are selected here, not in use cases. */
import { resolve } from 'node:path';
import type { Browser } from 'playwright';
import { executeSession, type SessionRequest } from './application/session.js';
import type { Decider, TextGenerator, Evaluator, GoalPlanner } from './domain/types.js';
import { openBrowser } from './infrastructure/browser/playwright.js';
import { createJevServices } from './infrastructure/models/jev.js';
import {
  createOpenRouterGenerator,
  createOpenRouterPlanner,
} from './infrastructure/models/openrouter.js';
import { RunObserver } from './infrastructure/telemetry/file-observer.js';

export type SessionOptions = SessionRequest & {
  directory: string;
  headed?: boolean;
  decide?: Decider;
  planGoal?: GoalPlanner;
  generateText?: TextGenerator;
  evaluator?: Evaluator;
  launch?: () => Promise<Browser>;
};

export function runSession(options: SessionOptions) {
  const telemetry = new RunObserver(options.directory);
  // Lazy clients ensure configuration failures are recorded by the session.
  let jev: ReturnType<typeof createJevServices> | undefined;
  const decide = options.decide;
  let planGoal = options.planGoal;
  let generateText = options.generateText;
  const evaluator = options.evaluator;
  return executeSession(options, {
    telemetry,
    openBrowser: () =>
      openBrowser({
        ...(options.headed === undefined ? {} : { headed: options.headed }),
        ...(options.launch === undefined ? {} : { launch: options.launch }),
        event: (type, data) => telemetry.event(type, data),
      }),
    decide: (input) => (decide ?? (jev ??= createJevServices()).decide)(input),
    planGoal: (input) => (planGoal ??= createOpenRouterPlanner())(input),
    generateText: (input) => (generateText ??= createOpenRouterGenerator())(input),
    evaluator: (input) => (evaluator ?? (jev ??= createJevServices()).evaluate)(input),
    tracePath: resolve(options.directory, 'trace.zip'),
  });
}

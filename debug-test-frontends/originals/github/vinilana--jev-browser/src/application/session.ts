import type { BrowserPort, RunTelemetry } from '../domain/ports.js';
import type {
  Decider,
  TextGenerator,
  Evaluator,
  Step,
  RunStatus,
  RunResult,
  RunLimits,
  Expectations,
  Evaluation,
  EvalInput,
  CommandResult,
  GoalPlan,
  GoalPlanner,
} from '../domain/types.js';
import { errorMessage } from '../domain/errors.js';
import { validateLimits } from '../domain/config.js';
import { MAX_COMMANDS, validateCommands } from '../domain/commands.js';
import { runHarness } from './harness.js';
import { evaluateRun } from './evaluate.js';

interface SessionBaseRequest extends Partial<RunLimits> {
  url: string;
  values: string[];
  expected?: Expectations;
  onPlan?: (plan: GoalPlan) => void | Promise<void>;
  onStep?: (step: Step) => void | Promise<void>;
}
export type SessionRequest = SessionBaseRequest &
  (
    | { goal: string; task?: never; commands?: never }
    | { goal?: never; task: string; commands?: never }
    | { goal?: never; task?: never; commands: string[] }
  );

export interface SessionDependencies {
  telemetry: RunTelemetry;
  openBrowser(): Promise<BrowserPort>;
  decide: Decider;
  planGoal: GoalPlanner;
  generateText: TextGenerator;
  evaluator: Evaluator;
  tracePath: string;
}

interface Execution {
  browser?: BrowserPort;
  status: RunStatus;
  history: Step[];
  commandResults: CommandResult[];
  error?: string;
}

export async function executeSession(
  request: SessionRequest,
  dependencies: SessionDependencies,
): Promise<RunResult> {
  const limits = validateLimits(request);
  const telemetry = dependencies.telemetry;
  await telemetry.init();
  const startedAt = new Date().toISOString();
  const started = performance.now();
  await telemetry.event('run.start', {
    ...requestedWork(request),
    url: request.url,
    ...limits,
    expected: request.expected ?? {},
    observability: true,
    eval: true,
  });

  let commands: string[] = [];
  let plan: GoalPlan | undefined;
  let execution: Execution;
  try {
    const resolved = await resolveCommands(request, dependencies);
    commands = resolved.commands;
    plan = resolved.plan;
    if (plan) {
      await telemetry.json('plan.json', plan);
      await telemetry.event('plan.created', plan);
    }
    execution = await executeBrowserTask(request, commands, dependencies, limits);
  } catch (error) {
    const message = errorMessage(error);
    await telemetry.event('run.error', { phase: 'planning', error: message });
    execution = {
      status: 'error',
      history: [],
      commandResults: [],
      error: message,
    };
  }
  try {
    const evaluation = await evaluateExecution(request, commands, dependencies, execution);
    await stopTrace(execution.browser, dependencies, telemetry);
    const result = buildResult({
      request,
      commands,
      execution,
      evaluation,
      ...(plan ? { plan } : {}),
      telemetry,
      started,
      startedAt,
    });
    await telemetry.event('run.end', {
      status: result.status,
      eval: result.evaluation.verdict,
      durationMs: result.durationMs,
    });
    await telemetry.finish(result);
    return result;
  } finally {
    await execution.browser?.close();
  }
}

async function resolveCommands(
  request: SessionRequest,
  dependencies: SessionDependencies,
): Promise<{ commands: string[]; plan?: GoalPlan }> {
  if ('goal' in request && request.goal !== undefined) {
    const goal = request.goal.trim();
    if (!goal) throw new Error('O objetivo não pode ser vazio.');
    const values = suppliedValueHints(request.values);
    const plan = await dependencies.telemetry.span('planner', { goal, values }, () =>
      dependencies.planGoal({ goal, values, maxCommands: MAX_COMMANDS }),
    );
    const commands = validateCommands(plan.commands);
    const normalizedPlan = { ...plan, goal, commands };
    await request.onPlan?.(normalizedPlan);
    return { commands, plan: normalizedPlan };
  }
  if ('commands' in request && request.commands !== undefined) {
    return { commands: validateCommands(request.commands) };
  }
  return { commands: validateCommands([request.task]) };
}

function requestedWork(request: SessionRequest): { goal: string } | { commands: string[] } {
  if ('goal' in request && request.goal !== undefined) return { goal: request.goal };
  if ('commands' in request && request.commands !== undefined)
    return { commands: request.commands };
  return { commands: [request.task] };
}

async function executeBrowserTask(
  request: SessionRequest,
  commands: string[],
  dependencies: SessionDependencies,
  limits: RunLimits,
): Promise<Execution> {
  const telemetry = dependencies.telemetry;
  const history: Step[] = [];
  const commandResults: CommandResult[] = [];
  let browser: BrowserPort | undefined;
  try {
    browser = await dependencies.openBrowser();
    const activeBrowser = browser;
    await telemetry.span('navigation', { url: request.url }, async () => {
      await activeBrowser.navigate(request.url);
      return { url: activeBrowser.url() };
    });

    let status: RunStatus = 'done';
    for (const [commandIndex, command] of commands.entries()) {
      const context = {
        ...(request.goal !== undefined ? { goal: request.goal } : {}),
        commands,
        commandIndex,
        completedCommands: commandResults
          .filter((item) => item.status === 'done')
          .map((item) => item.command),
      };
      const result = await runHarness({
        browser,
        task: command,
        values: request.values,
        commandIndex,
        stepOffset: history.length,
        ...limits,
        decide: (input) => {
          const observedInput = { ...input, context, values: suppliedValueHints(input.values) };
          return telemetry.span('jev', observedInput, () => dependencies.decide(observedInput));
        },
        generateText: (input) => {
          const observedInput = { ...input, context, values: suppliedValueHints(input.values) };
          return telemetry.span(
            'openrouter',
            observedInput,
            () => dependencies.generateText({ ...input, context }),
            (output) =>
              input.field.sensitive && output.text !== null
                ? { ...output, text: '[REDACTED]' }
                : output,
          );
        },
        onObserve: async (step, observation) => {
          await telemetry.capture(activeBrowser, evidenceName(step, 'before'), observation);
        },
        onStep: async (step) => {
          history.push(step);
          await telemetry.recordStep(step);
          await telemetry.capture(activeBrowser, evidenceName(step.step, 'after'));
          await request.onStep?.(step);
        },
      });
      status = result.status;
      commandResults.push({ commandIndex, command, status: result.status, steps: result.steps });
      if (status !== 'done') break;
    }
    return { browser, status, history, commandResults };
  } catch (error) {
    const message = errorMessage(error);
    await telemetry.event('run.error', { error: message });
    return {
      ...(browser ? { browser } : {}),
      status: 'error',
      history,
      commandResults,
      error: message,
    };
  }
}

async function evaluateExecution(
  request: SessionRequest,
  commands: string[],
  dependencies: SessionDependencies,
  execution: Execution,
): Promise<Evaluation> {
  const telemetry = dependencies.telemetry;
  const finalObservation = execution.browser
    ? await telemetry.capture(execution.browser, 'final')
    : null;
  const input: EvalInput | null = finalObservation
    ? {
        ...('goal' in request && request.goal !== undefined ? { goal: request.goal } : {}),
        commands,
        finalObservation,
        actions: execution.history.flatMap((step) =>
          step.executedAction
            ? [
                {
                  commandIndex: step.commandIndex,
                  command: step.command,
                  action: step.executedAction,
                  outcome: step.outcome,
                },
              ]
            : [],
        ),
      }
    : null;
  const evaluation = await evaluateRun(
    input,
    (evalInput) => telemetry.span('eval', evalInput, () => dependencies.evaluator(evalInput)),
    request.expected,
  );
  await telemetry.json('eval.json', evaluation);
  await telemetry.event('eval.result', evaluation);
  return evaluation;
}

async function stopTrace(
  browser: BrowserPort | undefined,
  dependencies: SessionDependencies,
  telemetry: RunTelemetry,
): Promise<void> {
  if (!browser) return;
  try {
    await browser.stopTrace(dependencies.tracePath);
  } catch (error) {
    telemetry.warnings.push(`trace.zip: ${errorMessage(error)}`);
  }
}

function buildResult({
  request,
  commands,
  execution,
  evaluation,
  plan,
  telemetry,
  started,
  startedAt,
}: {
  request: SessionRequest;
  commands: string[];
  execution: Execution;
  evaluation: Evaluation;
  plan?: GoalPlan;
  telemetry: RunTelemetry;
  started: number;
  startedAt: string;
}): RunResult {
  const durationMs = Math.round(performance.now() - started);
  return {
    schemaVersion: 3,
    ...('goal' in request && request.goal !== undefined ? { goal: request.goal } : {}),
    ...(plan ? { plan } : {}),
    commands,
    commandResults: execution.commandResults,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs,
    status: execution.status,
    steps: execution.history.length,
    url: execution.browser?.url() ?? request.url,
    history: execution.history,
    ...(execution.error === undefined ? {} : { error: execution.error }),
    evaluation,
    metrics: telemetry.metrics(),
    warnings: [...telemetry.warnings],
    exitCode: exitCodeFor(execution.status, evaluation.verdict),
  };
}

function exitCodeFor(status: RunStatus, verdict: Evaluation['verdict']): 0 | 1 | 2 {
  if (status === 'error') return 1;
  return status === 'done' && verdict === 'passed' ? 0 : 2;
}

function evidenceName(step: number, phase: 'before' | 'after'): string {
  return `evidence/step-${String(step).padStart(3, '0')}-${phase}`;
}

function suppliedValueHints(values: string[]): string[] {
  return values.map((value, index) => {
    const label = /^\s*([^=:\n]{1,60})\s*[:=]/.exec(value)?.[1]?.trim();
    return label ? `${label}=<provided>` : `<provided #${index + 1}>`;
  });
}

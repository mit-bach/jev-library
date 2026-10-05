import { candidates } from '../domain/actions.js';
import { navigationSatisfied } from '../domain/navigation.js';
import { errorMessage } from '../domain/errors.js';
import { selectedCandidate } from '../domain/validation.js';
import type {
  Candidate,
  ExecutableAction,
  Observation,
  Decider,
  Step,
  TextGenerator,
  HarnessStatus,
  TerminalStatus,
} from '../domain/types.js';
import type { BrowserPort, BrowserSnapshot } from '../domain/ports.js';
import { validateLimits, DEFAULT_LIMITS } from '../domain/config.js';

const MAX_REPEATED_DECISIONS = 2;
const MAX_RECORDED_ERROR_LENGTH = 500;
const REDACTED_VALUE = '[REDACTED]';
const MAX_CONSECUTIVE_WAITS = 5;

export interface HarnessOptions {
  browser: BrowserPort;
  task: string;
  values: string[];
  decide: Decider;
  generateText: TextGenerator;
  maxSteps?: number;
  minConfidence?: number;
  commandIndex?: number;
  stepOffset?: number;
  onStep?: (step: Step) => void | Promise<void>;
  onObserve?: (step: number, observation: Observation) => void | Promise<void>;
}

export interface HarnessResult {
  status: HarnessStatus;
  steps: number;
  url: string;
  history: Step[];
}

export async function runHarness({
  browser,
  task,
  values,
  decide,
  generateText,
  maxSteps = DEFAULT_LIMITS.maxSteps,
  minConfidence = DEFAULT_LIMITS.minConfidence,
  commandIndex = 0,
  stepOffset = 0,
  onStep,
  onObserve,
}: HarnessOptions): Promise<HarnessResult> {
  validateLimits({ maxSteps, minConfidence });
  const history: Step[] = [];
  const repetitions = new Map<string, number>();
  let terminalStatus: TerminalStatus | null = null;
  let consecutiveWaits = 0;

  for (let localStep = 1; localStep <= maxSteps && terminalStatus === null; localStep++) {
    const stepNumber = stepOffset + localStep;
    const started = performance.now();
    const snapshot = await browser.observe();
    try {
      const { observation } = snapshot;
      await onObserve?.(stepNumber, observation);
      const availableCandidates = candidates(observation);
      const emptyPage = !observation.text.trim() && observation.elements.length === 0;
      const navigationComplete = navigationSatisfied(task, observation);
      const waitCandidate = availableCandidates.find((item) => item.action.kind === 'wait')!;
      const decision = navigationComplete
        ? {
            choice: availableCandidates.find((item) => item.action.kind === 'done')!.id,
            confidence: 1,
          }
        : emptyPage
          ? { choice: waitCandidate.id, confidence: 1 }
          : await decide({
              task,
              values,
              observation,
              candidates: availableCandidates,
              history,
            });
      const selected = selectedCandidate(decision, availableCandidates);
      const record: Step = {
        step: stepNumber,
        commandIndex,
        command: task,
        url: observation.url,
        candidate: selected,
        confidence: decision.confidence,
        outcome: 'executed',
        durationMs: 0,
        decisionSource: navigationComplete ? 'postcondition' : emptyPage ? 'readiness' : 'jev',
      };
      if (navigationComplete)
        record.policyReason =
          'Navegação concluída: URL observada corresponde ao destino solicitado e a página apresenta conteúdo.';

      const isWait = selected.action.kind === 'wait';
      consecutiveWaits = isWait ? consecutiveWaits + 1 : 0;
      if (isWait)
        record.policyReason = emptyPage
          ? 'Página sem conteúdo: aguardar renderização antes de consultar o Jev.'
          : 'Espera sem efeito externo permitida independentemente da confiança, com limite de tentativas.';

      terminalStatus =
        consecutiveWaits > MAX_CONSECUTIVE_WAITS
          ? 'page_not_ready'
          : initialTerminalStatus({
              selected,
              confidence: decision.confidence,
              minConfidence,
              observation,
              repetitions,
            });

      if (terminalStatus) {
        record.outcome = terminalStatus;
      } else {
        terminalStatus = await prepareAndExecute({
          snapshot,
          record,
          task,
          values,
          observation,
          history,
          generateText,
        });
      }

      record.durationMs = Math.round(performance.now() - started);
      history.push(record);
      await onStep?.(record);
    } finally {
      await snapshot.release();
    }
  }

  return {
    status: terminalStatus ?? 'max_steps',
    steps: history.length,
    url: browser.url(),
    history,
  };
}

function initialTerminalStatus({
  selected,
  confidence,
  minConfidence,
  observation,
  repetitions,
}: {
  selected: Candidate;
  confidence: number;
  minConfidence: number;
  observation: Observation;
  repetitions: Map<string, number>;
}): TerminalStatus | null {
  // Waiting cannot submit a form or mutate external data. Its budget is checked by the loop.
  if (selected.action.kind === 'wait') return null;
  if (confidence < minConfidence) return 'low_confidence';
  if (selected.action.kind === 'done' || selected.action.kind === 'blocked') {
    return selected.action.kind;
  }
  const fingerprint = JSON.stringify([observation, selected.action]);
  const count = (repetitions.get(fingerprint) ?? 0) + 1;
  repetitions.set(fingerprint, count);
  return count > MAX_REPEATED_DECISIONS ? 'loop_detected' : null;
}

async function prepareAndExecute({
  snapshot,
  record,
  task,
  values,
  observation,
  history,
  generateText,
}: {
  snapshot: BrowserSnapshot;
  record: Step;
  task: string;
  values: string[];
  observation: Observation;
  history: Step[];
  generateText: TextGenerator;
}): Promise<TerminalStatus | null> {
  const prepared = await prepareAction({
    record,
    task,
    values,
    observation,
    history,
    generateText,
  });
  if (prepared.status) return prepared.status;

  record.executedAction = recordedAction(prepared.action, observation);
  try {
    await snapshot.execute(prepared.action);
  } catch (error) {
    record.outcome = 'execution_error';
    record.error = errorMessage(error, MAX_RECORDED_ERROR_LENGTH);
  }
  return null;
}

async function prepareAction({
  record,
  task,
  values,
  observation,
  history,
  generateText,
}: {
  record: Step;
  task: string;
  values: string[];
  observation: Observation;
  history: Step[];
  generateText: TextGenerator;
}): Promise<
  { action: ExecutableAction; status: null } | { action?: never; status: TerminalStatus }
> {
  const action = record.candidate.action;
  if (action.kind === 'done' || action.kind === 'blocked') {
    throw new Error(`Ação terminal inesperada durante execução: ${action.kind}.`);
  }
  if (action.kind !== 'fill') return { action, status: null };

  const field = observation.elements.find((element) => element.id === action.target);
  if (!field) {
    record.outcome = 'generation_error';
    record.error = 'Campo selecionado não encontrado.';
    return { status: 'generation_error' };
  }

  try {
    const generated = await generateText({ task, values, observation, field, history });
    if (generated.text !== null && /<provided(?:\s+#\d+)?>|\[REDACTED\]/i.test(generated.text)) {
      throw new Error('O gerador retornou um marcador de privacidade em vez do valor do campo.');
    }
    record.generation = field.sensitive
      ? { ...generated, text: generated.text === null ? null : REDACTED_VALUE }
      : generated;
    if (generated.text === null) {
      record.outcome = 'missing_input';
      return { status: 'missing_input' };
    }
    return { action: { ...action, value: generated.text }, status: null };
  } catch (error) {
    record.outcome = 'generation_error';
    record.error = errorMessage(error, MAX_RECORDED_ERROR_LENGTH);
    return { status: 'generation_error' };
  }
}

function recordedAction(action: ExecutableAction, observation: Observation): ExecutableAction {
  if (action.kind !== 'fill') return action;
  const field = observation.elements.find((element) => element.id === action.target);
  return field?.sensitive ? { ...action, value: REDACTED_VALUE } : action;
}

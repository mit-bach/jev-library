export type DirectAction =
  | { kind: 'click'; target: number }
  | { kind: 'select'; target: number; value: string }
  | { kind: 'enter'; target: number }
  | { kind: 'scroll'; direction: 'up' | 'down' }
  | { kind: 'back' | 'wait' };
export type FillAction = { kind: 'fill'; target: number; value: string };
export type ExecutableAction = DirectAction | FillAction;
export type CandidateAction =
  DirectAction | { kind: 'fill'; target: number } | { kind: 'done' } | { kind: 'blocked' };

export type RunStatus =
  | 'max_steps'
  | 'done'
  | 'blocked'
  | 'low_confidence'
  | 'page_not_ready'
  | 'loop_detected'
  | 'missing_input'
  | 'generation_error'
  | 'error';
export type HarnessStatus = Exclude<RunStatus, 'error'>;
export type TerminalStatus = Exclude<RunStatus, 'max_steps' | 'error'>;
export type StepOutcome = 'executed' | 'execution_error' | TerminalStatus;
export interface RunLimits {
  maxSteps: number;
  minConfidence: number;
}
export interface Expectations {
  text?: string;
  url?: string;
}
export interface ModelMetrics {
  calls: number;
  errors: number;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  callsWithUsage: number;
}
export interface RunResult {
  schemaVersion: 3;
  goal?: string;
  plan?: GoalPlan;
  commands: string[];
  commandResults: CommandResult[];
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  status: RunStatus;
  steps: number;
  url: string;
  history: Step[];
  error?: string;
  evaluation: Evaluation;
  metrics: Record<string, ModelMetrics>;
  warnings: string[];
  exitCode: 0 | 1 | 2;
}
export interface CommandResult {
  commandIndex: number;
  command: string;
  status: HarnessStatus;
  steps: number;
}

export interface Candidate {
  id: string;
  description: string;
  action: CandidateAction;
}
export type BrowserElementType = 'clickable' | 'editable' | 'select';
export interface BrowserElement {
  id: number;
  label: string;
  type: BrowserElementType;
  value: string;
  sensitive?: boolean;
  options: { value: string; label: string }[];
}
export interface Observation {
  url: string;
  title: string;
  text: string;
  scroll: { y: number; height: number; viewport: number };
  elements: BrowserElement[];
  truncated: boolean;
}

export interface Step {
  decisionSource?: 'jev' | 'readiness' | 'postcondition';
  policyReason?: string;
  step: number;
  commandIndex: number;
  command: string;
  url: string;
  candidate: Candidate;
  executedAction?: ExecutableAction;
  confidence: number;
  outcome: StepOutcome;
  generation?: GeneratedText;
  error?: string;
  durationMs: number;
}
export interface DecisionInput {
  context?: ExecutionContext;
  task: string;
  values: string[];
  observation: Observation;
  candidates: Candidate[];
  history: Step[];
}
export interface Decision {
  choice: string;
  confidence: number;
  model?: string;
  usage?: TokenUsage;
}
export type Decider = (input: DecisionInput) => Promise<Decision>;

export interface TextInput {
  context?: ExecutionContext;
  task: string;
  values: string[];
  observation: Observation;
  field: Observation['elements'][number];
  history: Step[];
}
export interface GeneratedText {
  text: string | null;
  reason: string;
  model: string;
  usage?: TokenUsage;
}
export type TextGenerator = (input: TextInput) => Promise<GeneratedText>;

export interface EvalInput {
  goal?: string;
  commands: string[];
  finalObservation: Observation;
  // Only actual actions and their outcomes: no executor success claim or confidence.
  actions: {
    commandIndex: number;
    command: string;
    action: ExecutableAction;
    outcome: StepOutcome;
  }[];
}
export interface Judgment {
  choice: 'complete' | 'incomplete' | 'unknown';
  confidence: number;
  model?: string;
  usage?: TokenUsage;
}
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}
export type Evaluator = (input: EvalInput) => Promise<Judgment>;

export interface ExecutionContext {
  goal?: string;
  commands: string[];
  commandIndex: number;
  completedCommands: string[];
}

export interface GoalPlanInput {
  goal: string;
  values: string[];
  maxCommands: number;
}
export interface GoalPlan {
  goal: string;
  commands: string[];
  reason: string;
  model: string;
  usage?: TokenUsage;
}
export type GoalPlanner = (input: GoalPlanInput) => Promise<GoalPlan>;
export interface Evaluation {
  version: 1;
  verdict: 'passed' | 'failed' | 'inconclusive' | 'error';
  reason: string;
  judge?: Judgment;
  checks: { name: string; passed: boolean }[];
  evidence: string;
}

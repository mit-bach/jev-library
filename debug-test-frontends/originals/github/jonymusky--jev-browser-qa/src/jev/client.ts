import { experimental_evaluate as evaluate, type Experimental_EvaluationQuestion } from 'ai';
import { gateway } from '@ai-sdk/gateway';

export const JEV_MODEL_ID = 'typesafe-ai/jev';

export type JevQuestion = Experimental_EvaluationQuestion;
export type JevState = Parameters<typeof evaluate>[0]['state'];

export interface JevCallRecord {
  purpose: string;
  startedAt: string;
  apiMs: number;
  inputTokens: number | undefined;
  outputTokens: number | undefined;
  questionIds: string[];
}

/** Every call made in this process, consumed by the reporter for the usage summary. */
export const jevCallLog: JevCallRecord[] = [];

const zeroDataRetention = (process.env.JEV_ZERO_DATA_RETENTION ?? 'true') !== 'false';

/**
 * One typed evaluation against a shared state. Thin wrapper over the AI SDK so
 * every call carries the same model, provider options and telemetry.
 */
export async function askJev<const Q extends Record<string, JevQuestion>>(
  purpose: string,
  state: JevState,
  questions: Q,
) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error('AI_GATEWAY_API_KEY is not set. Copy .env.example to .env and fill it in.');
  }
  const startedAt = new Date();
  const t0 = performance.now();
  const result = await evaluate({
    model: gateway.evaluationModel(JEV_MODEL_ID),
    state,
    questions,
    maxRetries: 2,
    providerOptions: {
      gateway: { zeroDataRetention, tags: ['jev-browser-qa'] },
    },
  });
  jevCallLog.push({
    purpose,
    startedAt: startedAt.toISOString(),
    apiMs: Math.round(performance.now() - t0),
    inputTokens: result.usage.inputTokens,
    outputTokens: result.usage.outputTokens,
    questionIds: Object.keys(questions),
  });
  return result;
}

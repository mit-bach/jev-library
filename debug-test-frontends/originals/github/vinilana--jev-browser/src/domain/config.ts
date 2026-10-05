import type { RunLimits } from './types.js';

export const DEFAULT_LIMITS: Readonly<RunLimits> = { maxSteps: 20, minConfidence: 0.55 };
export const EVAL_MIN_CONFIDENCE = 0.7;

export function validateLimits(input: Partial<RunLimits>): RunLimits {
  const maxSteps = input.maxSteps ?? DEFAULT_LIMITS.maxSteps;
  const minConfidence = input.minConfidence ?? DEFAULT_LIMITS.minConfidence;
  if (!Number.isInteger(maxSteps) || maxSteps < 1 || maxSteps > 100)
    throw new Error('maxSteps deve ser um inteiro entre 1 e 100.');
  if (!Number.isFinite(minConfidence) || minConfidence < 0 || minConfidence > 1)
    throw new Error('minConfidence deve estar entre 0 e 1.');
  return { maxSteps, minConfidence };
}

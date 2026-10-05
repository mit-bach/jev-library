import type { EvalInput, Evaluator, Evaluation } from '../domain/types.js';
import { EVAL_MIN_CONFIDENCE } from '../domain/config.js';
import { errorMessage } from '../domain/errors.js';
import { isConfidence } from '../domain/validation.js';

export async function evaluateRun(
  input: EvalInput | null,
  evaluator: Evaluator,
  expected: { text?: string; url?: string } = {},
): Promise<Evaluation> {
  const base = {
    version: 1 as const,
    evidence: 'final.observation.json',
    checks: [] as Evaluation['checks'],
  };
  if (!input)
    return {
      ...base,
      verdict: 'inconclusive',
      reason: 'Não foi possível capturar o estado final do navegador.',
    };
  if (expected.text !== undefined)
    base.checks.push({
      name: `Texto final contém: ${expected.text}`,
      passed: input.finalObservation.text.includes(expected.text),
    });
  if (expected.url !== undefined)
    base.checks.push({
      name: `URL final contém: ${expected.url}`,
      passed: input.finalObservation.url.includes(expected.url),
    });
  try {
    const judge = await evaluator(input);
    if (
      !['complete', 'incomplete', 'unknown'].includes(judge.choice) ||
      !isConfidence(judge.confidence)
    )
      throw new Error('Resposta inválida do avaliador.');
    if (base.checks.some((check) => !check.passed))
      return {
        ...base,
        judge,
        verdict: 'failed',
        reason: 'Uma ou mais verificações explícitas falharam.',
      };
    if (judge.confidence < EVAL_MIN_CONFIDENCE || judge.choice === 'unknown')
      return {
        ...base,
        judge,
        verdict: 'inconclusive',
        reason: `Evidência insuficiente ou confiança do avaliador abaixo de ${EVAL_MIN_CONFIDENCE.toFixed(2)}.`,
      };
    return {
      ...base,
      judge,
      verdict: judge.choice === 'complete' ? 'passed' : 'failed',
      reason:
        judge.choice === 'complete'
          ? 'O avaliador encontrou evidência suficiente de conclusão.'
          : 'O avaliador identificou requisitos não cumpridos.',
    };
  } catch (error) {
    return {
      ...base,
      verdict: 'error',
      reason: errorMessage(error),
    };
  }
}

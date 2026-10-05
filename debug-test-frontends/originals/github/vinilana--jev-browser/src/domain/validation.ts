import type { Candidate, Decision } from './types.js';

export function isConfidence(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export function selectedCandidate(decision: Decision, candidates: Candidate[]): Candidate {
  const selected = candidates.find((candidate) => candidate.id === decision.choice);
  if (!selected || !isConfidence(decision.confidence)) {
    throw new Error('Jev retornou uma decisão inválida. Nenhuma ação executada.');
  }
  return selected;
}

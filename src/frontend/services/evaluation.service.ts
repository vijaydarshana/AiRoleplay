/**
 * FRONTEND SERVICE: Evaluation
 * Abstracts HTTP calls to the /api/evaluate controller.
 * Used by view components — never calls AI SDKs directly.
 */

import type { TranscriptTurn, SessionScore } from '@/types';

export interface EvaluationRequest {
  scenarioId: string;
  transcript: TranscriptTurn[];
  duration: number;
  protocolCompletion: number;
}

export interface EvaluationResponse {
  score: SessionScore;
}

export async function evaluateSession(request: EvaluationRequest): Promise<EvaluationResponse> {
  const res = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? 'Evaluation API error');
  }

  return res.json() as Promise<EvaluationResponse>;
}

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
  let res: Response;
  try {
    res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error('Network error: Could not reach the evaluation service. Please check your internet connection.');
  }

  if (!res.ok) {
    let errMessage = 'Evaluation API error';
    try {
      const err = await res.json() as { error?: string };
      errMessage = err.error ?? errMessage;
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(errMessage);
  }

  try {
    return await res.json() as EvaluationResponse;
  } catch {
    throw new Error('Received an invalid response from the evaluation API.');
  }
}

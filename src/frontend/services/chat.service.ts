/**
 * FRONTEND SERVICE: Chat
 * Abstracts HTTP calls to the /api/chat controller.
 * Used by view components — never calls AI SDKs directly.
 */

import type { TranscriptTurn } from '@/types';

export interface ChatRequest {
  scenarioId: string;
  transcript: TranscriptTurn[];
}

export interface ChatResponse {
  text: string;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? 'Chat API error');
  }

  return res.json() as Promise<ChatResponse>;
}

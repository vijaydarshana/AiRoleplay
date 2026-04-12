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
  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch (networkErr) {
    throw new Error('Network error: Could not reach the server. Please check your internet connection.');
  }

  if (!res.ok) {
    let errMessage = 'Chat API error';
    try {
      const err = await res.json() as { error?: string };
      errMessage = err.error ?? errMessage;
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(errMessage);
  }

  try {
    return await res.json() as ChatResponse;
  } catch {
    throw new Error('Received an invalid response from the chat API.');
  }
}

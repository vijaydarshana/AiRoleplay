/**
 * FRONTEND SERVICE: TTS
 * Abstracts HTTP calls to the /api/tts controller.
 * Used by view components — never calls OpenAI directly.
 */

export type TTSVoice = 'nova' | 'shimmer' | 'fable' | 'echo' | 'alloy' | 'onyx';

export interface TTSRequest {
  text: string;
  voice?: TTSVoice;
}

export async function fetchTTSAudio(request: TTSRequest): Promise<Blob> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'TTS failed' }));
    throw new Error(err.error ?? 'TTS API error');
  }

  return res.blob();
}

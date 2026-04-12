/**
 * FRONTEND SERVICE: TTS
 * Abstracts HTTP calls to the /api/tts controller (ElevenLabs).
 * Used by view components — never calls ElevenLabs directly.
 */

export type TTSVoice = 'riya' | 'raju' | 'ruhaan' | 'aria' | 'rachel' | 'sarah' | 'charlotte' | 'alice' | 'bill' | 'george' | 'jessica';

export interface TTSRequest {
  text: string;
  voice?: TTSVoice;
  speed?: number;
  pitch?: number;
}

/** Check if the server already has an ElevenLabs key configured (cached per session) */
let serverKeyStatusCache: boolean | null = null;

export async function checkServerHasElevenLabsKey(): Promise<boolean> {
  if (serverKeyStatusCache !== null) return serverKeyStatusCache;
  try {
    let res = await fetch('/api/tts', { method: 'GET' });
    if (res.ok) {
      const data = await res.json() as { hasServerKey?: boolean };
      serverKeyStatusCache = data.hasServerKey ?? false;
      return serverKeyStatusCache;
    }
  } catch {
    // ignore
  }
  serverKeyStatusCache = true; // assume configured if check fails
  return true;
}

export async function fetchTTSAudio(request: TTSRequest): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error('Network error: Could not reach the TTS service. Please check your internet connection.');
  }

  if (!res.ok) {
    let errMessage = 'TTS failed';
    try {
      const err = await res.json() as { error?: string };
      errMessage = err.error ?? errMessage;
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(errMessage);
  }

  const blob = await res.blob();
  if (blob.size === 0) {
    throw new Error('TTS returned empty audio. Please try again.');
  }

  return blob;
}

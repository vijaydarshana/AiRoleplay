/**
 * FRONTEND SERVICE: TTS
 * Abstracts HTTP calls to the /api/tts controller (ElevenLabs).
 * Used by view components — never calls ElevenLabs directly.
 */

export type TTSVoice = 'rachel' | 'adam' | 'bella' | 'elli' | 'josh' | 'sam';

export interface TTSRequest {
  text: string;
  voice?: TTSVoice;
}

const STORAGE_KEY = 'elevenlabs_api_key';

function getUserApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export async function fetchTTSAudio(request: TTSRequest): Promise<Blob> {
  const userKey = getUserApiKey();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userKey) {
    headers['x-elevenlabs-key'] = userKey;
  }

  let res: Response;
  try {
    res = await fetch('/api/tts', {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error('Network error: Could not reach the TTS service. Please check your internet connection.');
  }

  if (!res.ok) {
    let errMessage = 'TTS failed';
    let needsSetup = false;
    try {
      const err = await res.json() as { error?: string; needsSetup?: boolean };
      errMessage = err.error ?? errMessage;
      needsSetup = err.needsSetup ?? false;
    } catch {
      // ignore JSON parse failure
    }
    const error = new Error(errMessage) as Error & { needsSetup?: boolean };
    error.needsSetup = needsSetup;
    throw error;
  }

  const blob = await res.blob();
  if (blob.size === 0) {
    throw new Error('TTS returned empty audio. Please try again.');
  }

  return blob;
}

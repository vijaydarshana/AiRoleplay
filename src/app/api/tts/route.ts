/**
 * CONTROLLER: TTS (Text-to-Speech)
 * Handles POST /api/tts
 * Uses ElevenLabs exclusively via ELEVENLABS_API_KEY env variable.
 */

import { NextRequest, NextResponse } from 'next/server';

// Default ElevenLabs voice IDs (well-known pre-made voices)
const VOICE_MAP: Record<string, string> = {
  // Indian accent voices (primary)
  riya:      'mActWQg9kibLro6Z2ouY',  // Riya Rao  – Indian female, warm & conversational (default)
  raju:      'hDMBFBpfBRLBGPKMXbFN',  // Raju      – Indian male, authentic & relatable
  ruhaan:    'ZF6FPAbjXT4488VcRRnw',  // Ruhaan    – Indian male, clear & cheerful
  // Other voices
  aria:      '9BWtsMINqrJLrRacOk9x',  // Aria      – expressive & human-sounding (female)
  rachel:    '21m00Tcm4TlvDq8ikWAM',  // Rachel    – calm & natural (female)
  sarah:     'EXAVITQu4vr4xnSDxMaL',  // Sarah     – warm & conversational (female)
  charlotte: 'XB0fDUnXU5powFXDhCwa',  // Charlotte – seductive & whispery (female)
  alice:     'Xb7hH8MSUJpSbSDYk0k2',  // Alice     – confident & British (female)
  bill:      'pqHfZKP75CvOlQylNhV4',  // Bill      – trustworthy & deep (male)
  george:    'JBFqnCBsd6RMkjVDRZzb',  // George    – warm & authoritative (male)
  jessica:   'cgSgspJ2msm6clMCkdW9',  // Jessica   – expressive & bright (female)
};

/** GET /api/tts — returns whether the server has ElevenLabs configured */
export async function GET() {
  const hasServerKey = !!(
    process.env.ELEVENLABS_API_KEY &&
    process.env.ELEVENLABS_API_KEY !== 'your-elevenlabs-api-key-here' &&
    process.env.ELEVENLABS_API_KEY.trim().length > 0
  );
  return NextResponse.json({ hasServerKey });
}

export async function POST(req: NextRequest) {
  try {
    let body: { text?: string; voice?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { text, voice = 'riya' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required and must be a string' }, { status: 400 });
    }
    if (text.trim().length === 0) {
      return NextResponse.json({ error: 'text cannot be empty' }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: 'text exceeds maximum length of 5000 characters' }, { status: 400 });
    }

    // Use server env key directly — no user-provided key fallback, no setup prompts
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

    if (!apiKey || apiKey === 'your-elevenlabs-api-key-here') {
      return NextResponse.json({ error: 'ElevenLabs API key is not configured on the server.' }, { status: 500 });
    }

    const voiceId = VOICE_MAP[voice.toLowerCase()] ?? voice;

    // Extract speed and pitch from body (only used for Indian voices)
    const bodyAny = body as { text?: string; voice?: string; speed?: number; pitch?: number };
    const speed = typeof bodyAny.speed === 'number' ? Math.max(0.5, Math.min(2.0, bodyAny.speed)) : 1.0;
    const pitch = typeof bodyAny.pitch === 'number' ? Math.max(-20, Math.min(20, bodyAny.pitch)) : 0;

    const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.40,
          similarity_boost: 0.80,
          style: 0.45,
          use_speaker_boost: true,
          speed: speed,
        },
      }),
    });

    if (!response.ok) {
      let errDetail = '';
      try {
        const err = await response.json() as { detail?: { message?: string } | string };
        errDetail = typeof err?.detail === 'object' ? (err.detail?.message ?? '') : (String(err?.detail ?? ''));
      } catch { /* ignore */ }
      console.error('[TTSController] ElevenLabs error', response.status, errDetail);
      return NextResponse.json(
        { error: `ElevenLabs TTS failed (${response.status}): ${errDetail || 'Unknown error'}` },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    if (audioBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'ElevenLabs returned empty audio. Please try again.' }, { status: 500 });
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'X-TTS-Provider': 'elevenlabs',
      },
    });
  } catch (err) {
    console.error('[TTSController] Error:', err);
    if (err instanceof TypeError && (err as Error).message.includes('fetch')) {
      return NextResponse.json({ error: 'Network error reaching ElevenLabs. Please check your connection.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

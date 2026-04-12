/**
 * CONTROLLER: TTS (Text-to-Speech)
 * Handles POST /api/tts
 * Primary: ElevenLabs TTS API.
 * Fallback: OpenAI TTS (when ElevenLabs free-tier restricts library voices).
 */

import { NextRequest, NextResponse } from 'next/server';

// Default ElevenLabs voice IDs (well-known pre-made voices)
const VOICE_MAP: Record<string, string> = {
  rachel: '21m00Tcm4TlvDq8ikWAM',   // Rachel – calm, professional (default)
  adam: 'pNInz6obpgDQGcFmaJgB',      // Adam – deep, authoritative
  bella: 'EXAVITQu4vr4xnSDxMaL',     // Bella – warm, friendly
  elli: 'MF3mGyEYCl7XYWbV9V6O',      // Elli – young, energetic
  josh: 'TxGEqnHWrfWFTfGW9XjX',      // Josh – conversational
  sam: 'yoZ06aMxZJJ28mfd3POQ',        // Sam – neutral, clear
};

// Map ElevenLabs voice names to OpenAI TTS voices (fallback)
const OPENAI_VOICE_MAP: Record<string, string> = {
  rachel: 'nova',    // calm, professional female
  adam: 'onyx',      // deep, authoritative male
  bella: 'shimmer',  // warm, friendly female
  elli: 'nova',      // young, energetic female
  josh: 'echo',      // conversational male
  sam: 'alloy',      // neutral, clear
};

async function generateOpenAITTS(text: string, voice: string): Promise<ArrayBuffer> {
  const openaiVoice = OPENAI_VOICE_MAP[voice.toLowerCase()] ?? 'alloy';
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: openaiVoice,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI TTS failed: ${err}`);
  }

  return response.arrayBuffer();
}

export async function POST(req: NextRequest) {
  try {
    let body: { text?: string; voice?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { text, voice = 'rachel' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required and must be a string' }, { status: 400 });
    }
    if (text.trim().length === 0) {
      return NextResponse.json({ error: 'text cannot be empty' }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: 'text exceeds maximum length of 5000 characters' }, { status: 400 });
    }

    // Accept user-provided key from header (set by frontend from localStorage) OR fall back to env
    const userKey = req.headers.get('x-elevenlabs-key');
    const apiKey = (userKey && userKey.trim().length > 0 && userKey !== 'your-elevenlabs-api-key-here')
      ? userKey.trim()
      : process.env.ELEVENLABS_API_KEY;

    const hasElevenLabsKey = apiKey && apiKey !== 'your-elevenlabs-api-key-here';

    if (hasElevenLabsKey) {
      const voiceId = VOICE_MAP[voice.toLowerCase()] ?? voice;
      // output_format must be a query parameter for ElevenLabs v1 API (not in body)
      const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

      try {
        const response = await fetch(ttsUrl, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        });

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          if (audioBuffer.byteLength > 0) {
            return new NextResponse(audioBuffer, {
              status: 200,
              headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-store',
                'X-TTS-Provider': 'elevenlabs',
              },
            });
          }
        }

        // Check if it's a free-tier library voice restriction or auth error — fall through to OpenAI
        if (response.status === 401 || response.status === 403) {
          let errDetail = '';
          try {
            const err = await response.json() as { detail?: { message?: string } | string };
            errDetail = typeof err?.detail === 'object' ? (err.detail?.message ?? '') : (String(err?.detail ?? ''));
          } catch { /* ignore */ }

          const isFreeRestriction = errDetail.toLowerCase().includes('free') ||
            errDetail.toLowerCase().includes('library') ||
            errDetail.toLowerCase().includes('upgrade') ||
            response.status === 403;

          if (!isFreeRestriction && response.status === 401) {
            return NextResponse.json({ error: 'Invalid ElevenLabs API key. Please check your key in the Voice Setup.', needsSetup: true }, { status: 401 });
          }
          // Free-tier restriction — fall through to OpenAI TTS below
          console.warn('[TTSController] ElevenLabs free-tier restriction, falling back to OpenAI TTS:', errDetail);
        } else if (response.status === 422) {
          // Invalid voice — fall through to OpenAI
          console.warn('[TTSController] ElevenLabs invalid voice, falling back to OpenAI TTS');
        } else if (response.status === 429) {
          return NextResponse.json({ error: 'ElevenLabs rate limit reached. Please wait a moment and try again.' }, { status: 429 });
        } else if (!response.ok) {
          // Other errors — fall through to OpenAI TTS
          console.warn('[TTSController] ElevenLabs error', response.status, '— falling back to OpenAI TTS');
        }
      } catch (fetchErr) {
        console.warn('[TTSController] ElevenLabs fetch error, falling back to OpenAI TTS:', fetchErr);
      }
    }

    // Fallback: OpenAI TTS
    try {
      const audioBuffer = await generateOpenAITTS(text, voice);
      if (audioBuffer.byteLength === 0) {
        return NextResponse.json({ error: 'TTS returned empty audio. Please try again.' }, { status: 500 });
      }
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-store',
          'X-TTS-Provider': 'openai',
        },
      });
    } catch (openaiErr) {
      console.error('[TTSController] OpenAI TTS fallback also failed:', openaiErr);
      return NextResponse.json({ error: 'TTS service unavailable. Please try again.' }, { status: 500 });
    }
  } catch (err) {
    console.error('[TTSController] Error:', err);
    if (err instanceof TypeError && (err as Error & { message: string }).message.includes('fetch')) {
      return NextResponse.json({ error: 'Network error reaching TTS service. Please check your connection.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * CONTROLLER: TTS (Text-to-Speech)
 * Handles POST /api/tts
 * Receives text and voice params, delegates to OpenAI TTS API.
 */

import { NextRequest, NextResponse } from 'next/server';

/** Resolve the correct OpenAI key regardless of env variable swap */
function resolveOpenAIKey(): string | undefined {
  const key1 = process.env.OPENAI_API_KEY;
  const key2 = process.env.ANTHROPIC_API_KEY;
  // OpenAI keys start with "sk-" but NOT "sk-ant-"
  if (key1 && key1.startsWith('sk-') && !key1.startsWith('sk-ant-')) return key1;
  if (key2 && key2.startsWith('sk-') && !key2.startsWith('sk-ant-')) return key2;
  return key1; // fallback
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'nova' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const apiKey = resolveOpenAIKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: text,
        voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message ?? 'TTS request failed' },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[TTSController] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



import { NextRequest, NextResponse } from 'next/server';


function resolveOpenAIKey(): string | undefined {
  
  const whisperKey = process.env.WHISPER_API_KEY;
  if (whisperKey && whisperKey.trim() && !whisperKey.startsWith('your-')) {
    return whisperKey.trim();
  }
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return undefined;
  const trimmed = openaiKey.trim();
  
  if (trimmed.startsWith('sk-ant-')) {
    console.error('[WhisperController] OPENAI_API_KEY contains an Anthropic key. Set WHISPER_API_KEY with your OpenAI key.');
    return undefined;
  }
  return trimmed;
}


function getFileExtension(blob: Blob, fallbackName: string): string {
  const type = blob.type.toLowerCase();
  if (type.includes('mp4') || type.includes('m4a')) return 'mp4';
  if (type.includes('ogg')) return 'ogg';
  if (type.includes('wav')) return 'wav';
  if (type.includes('flac')) return 'flac';
 
  if (fallbackName.endsWith('.mp4')) return 'mp4';
  if (fallbackName.endsWith('.ogg')) return 'ogg';
  
  return 'webm';
}

export async function POST(req: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid form data. Expected multipart/form-data with audio file.' }, { status: 400 });
    }

    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ error: 'audio file is required in form data' }, { status: 400 });
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    if (audioFile.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Audio file exceeds 25MB limit. Please record a shorter clip.' }, { status: 413 });
    }

    if (audioFile.size === 0) {
      return NextResponse.json({ error: 'Audio file is empty. Please try recording again.' }, { status: 400 });
    }

    const apiKey = resolveOpenAIKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment.' }, { status: 500 });
    }

    const originalName = audioFile instanceof File ? audioFile.name : 'audio.webm';
    const ext = getFileExtension(audioFile, originalName);
    const fileName = `audio.${ext}`;

    const whisperForm = new FormData();
    whisperForm.append('file', audioFile, fileName);
    whisperForm.append('model', 'whisper-1');
    whisperForm.append('language', 'en');
    whisperForm.append('response_format', 'json');
    // temperature=0.2 gives Whisper slight flexibility to handle quiet/low-volume speech
    whisperForm.append('temperature', '0.2');
    // Prompt primes Whisper with domain context so it better recognises
    // customer-service vocabulary, names, soft/quiet/low-volume and accented speech
    whisperForm.append(
      'prompt',
      'Customer service roleplay conversation. The speaker may speak quietly or softly. Transcribe every word accurately even if the audio is low volume, including filler words like um, uh, okay, yes, no, hello, thank you, sorry.'
    );

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperForm,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
      console.error('[WhisperController] OpenAI error:', err);

      if (response.status === 401) {
        return NextResponse.json({ error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY.' }, { status: 401 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: 'OpenAI rate limit reached. Please wait a moment and try again.' }, { status: 429 });
      }
      if (response.status === 400) {
        return NextResponse.json({ error: 'Audio format not supported. Please try again.' }, { status: 400 });
      }

      return NextResponse.json(
        { error: err?.error?.message ?? 'Whisper transcription failed' },
        { status: response.status }
      );
    }

    const data = await response.json() as { text?: string };
    return NextResponse.json({ text: data.text ?? '' });
  } catch (err) {
    console.error('[WhisperController] Error:', err);
    if (err instanceof TypeError && (err as Error).message.includes('fetch') || (err as Error).message.includes('network')) {
      return NextResponse.json({ error: 'Network error reaching OpenAI. Please check your connection.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

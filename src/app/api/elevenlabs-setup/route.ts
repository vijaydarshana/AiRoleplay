/**
 * CONTROLLER: ElevenLabs API Key Verification
 * POST /api/elevenlabs-setup
 * Verifies a user-provided ElevenLabs API key by making a lightweight call.
 * The key is NOT stored server-side — it's only used for verification.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    let body: { apiKey?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
    }

    const { apiKey } = body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json({ ok: false, error: 'API key is required' }, { status: 400 });
    }

    // Verify by fetching the user's voice list — lightweight, read-only endpoint
    const res = await fetch('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey.trim(),
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 401) {
      return NextResponse.json({ ok: false, error: 'Invalid API key. Please check your ElevenLabs key and try again.' }, { status: 200 });
    }
    if (res.status === 429) {
      return NextResponse.json({ ok: false, error: 'Rate limit reached. Please wait a moment and try again.' }, { status: 200 });
    }
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'Could not verify key. Please try again.' }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[ElevenLabsSetup] Error:', err);
    if (err instanceof TypeError) {
      return NextResponse.json({ ok: false, error: 'Network error reaching ElevenLabs. Check your connection.' }, { status: 200 });
    }
    return NextResponse.json({ ok: false, error: 'Verification failed. Please try again.' }, { status: 200 });
  }
}

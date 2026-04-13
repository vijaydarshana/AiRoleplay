/**
 * CONTROLLER: Chat
 * Handles POST /api/chat
 * Receives conversation context, delegates to prompt service and Anthropic SDK.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/backend/services/prompt.service';
import { findScenario } from '@/backend/models/scenario.model';
import type { TranscriptTurn } from '@/types';

/** Resolve the correct Anthropic key regardless of env variable swap */
function resolveAnthropicKey(): string | undefined {
  const key1 = process.env.ANTHROPIC_API_KEY;
  const key2 = process.env.OPENAI_API_KEY;
  // Anthropic keys start with "sk-ant-"
  if (key1 && key1.startsWith('sk-ant-')) return key1;
  if (key2 && key2.startsWith('sk-ant-')) return key2;
  return key1; // fallback
}

const anthropic = new Anthropic({
  apiKey: resolveAnthropicKey(),
});

export async function POST(req: NextRequest) {
  try {
    let body: { scenarioId?: string; transcript?: TranscriptTurn[] };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { scenarioId, transcript } = body;

    if (!scenarioId || typeof scenarioId !== 'string') {
      return NextResponse.json({ error: 'scenarioId is required and must be a string' }, { status: 400 });
    }
    if (!Array.isArray(transcript)) {
      return NextResponse.json({ error: 'transcript must be an array' }, { status: 400 });
    }

    const apiKey = resolveAnthropicKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your environment.' }, { status: 500 });
    }

    const scenario = findScenario(scenarioId);
    const systemPrompt = buildSystemPrompt(scenario);

    const messages: Anthropic.MessageParam[] = transcript.map((turn) => ({
      role: turn.speaker === 'candidate' ? 'user' : 'assistant',
      content: turn.text,
    }));

    if (messages.length === 0 || messages[messages.length - 1].role === 'assistant') {
      messages.push({
        role: 'user',
        content:
          transcript.length === 0
            ? '[The store executive is ready to help. Begin as the customer.]'
            : '[Please continue as the customer]',
      });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: systemPrompt,
      messages,
    });

    const aiText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ text: aiText });
  } catch (error) {
    console.error('[ChatController] Error:', error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json({ error: 'Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY.' }, { status: 401 });
      }
      if (error.status === 429) {
        return NextResponse.json({ error: 'Anthropic rate limit reached. Please wait a moment and try again.' }, { status: 429 });
      }
      if (error.status === 529) {
        return NextResponse.json({ error: 'Anthropic API is overloaded. Please try again shortly.' }, { status: 503 });
      }
      return NextResponse.json({ error: `Anthropic API error: ${error.message}` }, { status: error.status ?? 500 });
    }

    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json({ error: 'Network error reaching Anthropic. Please check your connection.' }, { status: 503 });
    }

    return NextResponse.json(
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    );
  }
}
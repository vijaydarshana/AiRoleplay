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
    const body = await req.json();
    const { scenarioId, transcript } = body as {
      scenarioId: string;
      transcript: TranscriptTurn[];
    };

    if (!scenarioId || !Array.isArray(transcript)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const scenario = findScenario(scenarioId);
    const systemPrompt = buildSystemPrompt(scenario);

    // Build conversation history for Claude
    const messages: Anthropic.MessageParam[] = transcript.map((turn) => ({
      role: turn.speaker === 'candidate' ? 'user' : 'assistant',
      content: turn.text,
    }));

    // Ensure the last message is from the user so Claude can respond
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
    return NextResponse.json(
      { error: 'Failed to get AI response. Please check your API key.' },
      { status: 500 }
    );
  }
}
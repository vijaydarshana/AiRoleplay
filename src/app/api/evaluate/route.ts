/**
 * CONTROLLER: Evaluate
 * Handles POST /api/evaluate
 * Receives session data, delegates to prompt service and Anthropic SDK.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildEvaluationPrompt } from '@/backend/services/prompt.service';
import { findScenario } from '@/backend/models/scenario.model';
import type { TranscriptTurn, SessionScore } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    let body: { scenarioId?: string; transcript?: TranscriptTurn[]; duration?: number; protocolCompletion?: number };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { scenarioId, transcript, duration, protocolCompletion } = body;

    if (!scenarioId || typeof scenarioId !== 'string') {
      return NextResponse.json({ error: 'scenarioId is required and must be a string' }, { status: 400 });
    }
    if (!Array.isArray(transcript)) {
      return NextResponse.json({ error: 'transcript must be an array' }, { status: 400 });
    }
    if (transcript.length < 2) {
      return NextResponse.json({ error: 'Transcript must contain at least 2 turns to evaluate.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your environment.' }, { status: 500 });
    }

    const scenario = findScenario(scenarioId);
    const prompt = buildEvaluationPrompt(scenario, transcript, duration ?? 0, protocolCompletion ?? 0);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText =
      response.content[0].type === 'text' ? response.content[0].text : '{}';

    let score: SessionScore;
    try {
      score = JSON.parse(rawText) as SessionScore;
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          score = JSON.parse(jsonMatch[0]) as SessionScore;
        } catch {
          console.error('[EvaluateController] JSON parse failed. Raw:', rawText.slice(0, 200));
          return NextResponse.json({ error: 'AI returned an invalid evaluation format. Please try again.' }, { status: 500 });
        }
      } else {
        console.error('[EvaluateController] No JSON found in AI response. Raw:', rawText.slice(0, 200));
        return NextResponse.json({ error: 'Could not parse evaluation from AI response. Please try again.' }, { status: 500 });
      }
    }

    return NextResponse.json({ score });
  } catch (error) {
    console.error('[EvaluateController] Error:', error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json({ error: 'Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY.' }, { status: 401 });
      }
      if (error.status === 429) {
        return NextResponse.json({ error: 'Anthropic rate limit reached. Please wait a moment and try again.' }, { status: 429 });
      }
      return NextResponse.json({ error: `Anthropic API error: ${error.message}` }, { status: error.status ?? 500 });
    }

    return NextResponse.json(
      { error: 'Failed to evaluate session. Please try again.' },
      { status: 500 }
    );
  }
}
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
    const body = await req.json();
    const { scenarioId, transcript, duration, protocolCompletion } = body as {
      scenarioId: string;
      transcript: TranscriptTurn[];
      duration: number;
      protocolCompletion: number;
    };

    if (!scenarioId || !Array.isArray(transcript)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const scenario = findScenario(scenarioId);
    const prompt = buildEvaluationPrompt(scenario, transcript, duration, protocolCompletion);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText =
      response.content[0].type === 'text' ? response.content[0].text : '{}';

    // Parse JSON response from Claude
    let score: SessionScore;
    try {
      score = JSON.parse(rawText) as SessionScore;
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        score = JSON.parse(jsonMatch[0]) as SessionScore;
      } else {
        throw new Error('Could not parse evaluation JSON from AI response');
      }
    }

    return NextResponse.json({ score });
  } catch (error) {
    console.error('[EvaluateController] Error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate session. Please try again.' },
      { status: 500 }
    );
  }
}
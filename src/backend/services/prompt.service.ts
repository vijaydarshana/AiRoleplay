/**
 * BACKEND SERVICE: Prompt
 * Builds AI prompts for chat and evaluation.
 * Server-side only — used by API route controllers.
 */

import type { Scenario, TranscriptTurn } from '@/types';

export function buildSystemPrompt(scenario: Scenario): string {
  const { customer } = scenario;
  return `You are ${customer.name}, a ${customer.age} ${customer.gender} customer at a ConnectIndia Telecom store in India.

SITUATION: ${customer.situation}
YOUR EMOTIONAL STATE: ${customer.emotion}
WHAT YOU NEED: ${customer.need}
YOUR BACKSTORY: ${customer.backstory}

STRICT CHARACTER RULES:
1. Stay in character as ${customer.name} at ALL times. Never break character.
2. Do NOT offer help, hints, or guidance to the store executive. You are the customer, not a trainer.
3. Respond naturally and emotionally — you are stressed, frustrated, or skeptical depending on your profile.
4. Ask follow-up questions if the executive's answers are vague or incomplete.
5. If the executive handles you well (empathy, clear explanation, professionalism), gradually warm up.
6. If the executive is rude, dismissive, or unhelpful, express your dissatisfaction clearly.
7. Do NOT mention scoring, assessment, or roleplay mechanics. This is a real interaction for you.
8. Use natural Indian English speech patterns. Keep responses to 2–4 sentences typically.
9. If asked for documents, ask which ones are acceptable and show mild concern about not having your phone.
10. You may ask about timelines, costs, and number retention — these are realistic customer concerns.

OPENING: Start by briefly explaining your situation to the executive who greets you.

Remember: Your job is to be a realistic, emotionally authentic customer — not an easy one.`;
}

export function buildEvaluationPrompt(
  scenario: Scenario,
  transcript: TranscriptTurn[],
  duration: number,
  protocolCompletion: number
): string {
  const formatted = transcript
    .map((t) => `[${t.speaker === 'ai' ? formatCustomerLabel(scenario) : 'CANDIDATE'}]: ${t.text}`)
    .join('\n');

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;

  return `You are a strict, fair evaluator assessing a customer service roleplay performance.

SCENARIO: ${scenario.title} — ${scenario.description}
CUSTOMER PROFILE: ${scenario.customer.name}, ${scenario.customer.emotion}
SESSION DURATION: ${mins}m ${secs}s
PROTOCOL CHECKLIST COMPLETION: ${protocolCompletion}%
TOTAL TURNS: ${transcript.length}

FULL TRANSCRIPT:
${formatted}

EVALUATION TASK:
Score the CANDIDATE's performance ONLY (not the AI customer). Be STRICT and FAIR — do not inflate scores. A score of 70–100 should require genuinely good performance.

Return a JSON object with this EXACT structure (no markdown, no code blocks, just pure JSON):
{
  "overall": <number 0-100>,
  "summary": "<2-3 sentence overall assessment of the candidate's performance>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "criteria": [
    {
      "id": "communication",
      "name": "Communication Clarity",
      "score": <number 0-100>,
      "weight": 25,
      "feedback": "<2-3 sentence specific feedback on how the candidate communicated>",
      "highlights": ["<specific moment 1>", "<specific moment 2>"],
      "improvements": ["<specific improvement 1>", "<specific improvement 2>"]
    },
    {
      "id": "empathy",
      "name": "Empathy & Emotional Intelligence",
      "score": <number 0-100>,
      "weight": 20,
      "feedback": "<2-3 sentence feedback on empathy shown>",
      "highlights": ["<moment>"],
      "improvements": ["<improvement>"]
    },
    {
      "id": "process",
      "name": "Process Adherence",
      "score": <number 0-100>,
      "weight": 25,
      "feedback": "<2-3 sentence feedback on process followed>",
      "highlights": ["<moment>"],
      "improvements": ["<improvement>"]
    },
    {
      "id": "resolution",
      "name": "Problem Resolution",
      "score": <number 0-100>,
      "weight": 20,
      "feedback": "<2-3 sentence feedback on how effectively the issue was resolved>",
      "highlights": ["<moment>"],
      "improvements": ["<improvement>"]
    },
    {
      "id": "professionalism",
      "name": "Professionalism & Courtesy",
      "score": <number 0-100>,
      "weight": 10,
      "feedback": "<2-3 sentence feedback on professionalism>",
      "highlights": ["<moment>"],
      "improvements": ["<improvement>"]
    }
  ],
  "protocolCompletion": ${protocolCompletion}
}`;
}

function formatCustomerLabel(scenario: Scenario): string {
  return `${scenario.customer.name.toUpperCase()} (AI)`;
}

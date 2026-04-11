/**
 * BACKEND MODEL: Scenario
 * Defines the data structures and static data for roleplay scenarios.
 * Server-side only — imported by API route controllers and backend services.
 */

import type { Scenario, ProtocolItem } from '@/types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'sim-replacement',
    title: 'SIM Card Replacement',
    subtitle: 'Stolen phone emergency',
    difficulty: 'Beginner',
    duration: '8–12 min',
    customer: {
      name: 'Rahul Mehta',
      age: 'Mid-30s',
      gender: 'Male',
      emotion: 'Stressed & frustrated',
      situation: 'Phone was stolen this morning on the metro',
      need: 'Urgent SIM replacement with same number',
      backstory:
        'Rahul is a marketing manager who relies heavily on his phone for work. His phone was pickpocketed on the Delhi Metro at 8 AM. He has important client calls scheduled today and is visibly anxious.',
    },
    description:
      'Handle an urgent SIM replacement request from a distressed customer whose phone was stolen. Verify identity, explain the process, and ensure the customer feels reassured.',
    objectives: [
      "Greet and acknowledge the customer's distress",
      'Verify customer identity using alternate documents',
      'Explain SIM replacement process and timeline',
      'Address concerns about number retention',
      'Complete the service request professionally',
    ],
  },
  {
    id: 'bill-dispute',
    title: 'Bill Dispute Resolution',
    subtitle: 'Unexpected roaming charges',
    difficulty: 'Intermediate',
    duration: '10–15 min',
    customer: {
      name: 'Priya Sharma',
      age: 'Late-20s',
      gender: 'Female',
      emotion: 'Angry & demanding',
      situation: 'Received a bill 3x higher than usual with unexplained roaming charges',
      need: 'Explanation and waiver of charges',
      backstory:
        'Priya is a software developer who traveled to Bangalore last month. She claims she never activated international roaming and is furious about a ₹4,200 unexpected charge on her monthly bill.',
    },
    description:
      'Resolve a billing dispute with an angry customer who received unexpected roaming charges. De-escalate the situation, investigate the charges, and offer a fair resolution.',
    objectives: [
      "De-escalate the customer's frustration",
      'Review account details and identify charge source',
      'Explain roaming activation policy clearly',
      'Offer appropriate resolution or escalation path',
      'Ensure customer leaves satisfied',
    ],
  },
  {
    id: 'new-connection',
    title: 'New Connection Setup',
    subtitle: 'Switching from competitor',
    difficulty: 'Advanced',
    duration: '12–18 min',
    customer: {
      name: 'Arjun Nair',
      age: 'Early-40s',
      gender: 'Male',
      emotion: 'Skeptical & comparing',
      situation: 'Considering switching from Airtel after 8 years',
      need: 'Best plan for family of 4 with heavy data usage',
      backstory:
        "Arjun is a business owner who needs reliable connectivity. He's done his research and keeps comparing ConnectIndia plans against Airtel. He wants to be convinced, but needs specific data and pricing to make a decision.",
    },
    description:
      "Convert a skeptical prospect switching from a competitor. Understand the family's data needs, recommend the right plan, address objections, and close the new connection.",
    objectives: [
      "Understand customer's current plan and pain points",
      'Recommend appropriate family plan',
      'Address competitor comparison objections',
      'Explain number portability process',
      'Complete new connection documentation',
    ],
  },
];

export const DEFAULT_PROTOCOL_ITEMS: ProtocolItem[] = [
  {
    id: 'protocol-greeting',
    label: 'Greeted the customer',
    keywords: ['hello', 'hi', 'welcome', 'good morning', 'good afternoon', 'namaste', 'greet'],
    checked: false,
  },
  {
    id: 'protocol-empathy',
    label: 'Showed empathy',
    keywords: ['sorry', 'understand', 'apologize', 'feel', 'concern', 'difficult', 'tough', 'empathize'],
    checked: false,
  },
  {
    id: 'protocol-identity',
    label: 'Verified customer identity',
    keywords: ['id', 'identity', 'aadhaar', 'pan', 'document', 'verify', 'proof', 'number', 'account'],
    checked: false,
  },
  {
    id: 'protocol-process',
    label: 'Explained the process',
    keywords: ['process', 'step', 'procedure', 'how', 'explain', 'take', 'minutes', 'hours', 'time'],
    checked: false,
  },
  {
    id: 'protocol-reassurance',
    label: 'Reassured the customer',
    keywords: ['dont worry', "don't worry", 'assured', 'safe', 'secure', 'guarantee', 'help', 'resolve', 'take care'],
    checked: false,
  },
  {
    id: 'protocol-resolution',
    label: 'Offered a clear resolution',
    keywords: ['will', 'can', 'arrange', 'provide', 'offer', 'solution', 'resolve', 'done', 'complete', 'new sim'],
    checked: false,
  },
  {
    id: 'protocol-closing',
    label: 'Closed the interaction professionally',
    keywords: ['thank', 'pleasure', 'anything else', 'help you', 'have a', 'goodbye', 'bye', 'take care'],
    checked: false,
  },
];

/**
 * Find a scenario by ID. Falls back to the first scenario if not found.
 */
export function findScenario(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

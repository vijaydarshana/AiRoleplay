export type ScenarioId = 'sim-replacement' | 'bill-dispute' | 'new-connection';

export interface CustomerPersona {
  name: string;
  age: string;
  gender: string;
  emotion: string;
  situation: string;
  need: string;
  backstory: string;
}

export interface Scenario {
  id: ScenarioId;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  customer: CustomerPersona;
  description: string;
  objectives: string[];
}

export interface ProtocolItem {
  id: string;
  label: string;
  keywords: string[];
  checked: boolean;
}

export interface TranscriptTurn {
  id: string;
  speaker: 'ai' | 'candidate';
  text: string;
  timestamp: number;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  score: number; // 0–100
  weight: number; // percentage weight
  feedback: string;
  highlights: string[];
  improvements: string[];
}

export interface SessionScore {
  overall: number;
  criteria: EvaluationCriteria[];
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  protocolCompletion: number; // 0–100
}

export interface SessionRecord {
  id: string;
  scenarioId: ScenarioId;
  scenarioTitle: string;
  startedAt: number;
  duration: number; // seconds
  turns: number;
  transcript: TranscriptTurn[];
  score: SessionScore;
  protocolItems: ProtocolItem[];
}

export type AIStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
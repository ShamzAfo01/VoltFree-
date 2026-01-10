
export interface ResistorPair {
  r1: number;
  r2: number;
  r1Formatted: string;
  r2Formatted: string;
  actualVOut: number;
  deviation: number;
  powerR1: number;
  powerR2: number;
  impedance: number;
  isSafe: boolean;
  message: string;
}

export interface CalculationResult {
  bestPair: ResistorPair | null;
  error?: string;
}

export interface AiExplanation {
  explanation: string;
  loading: boolean;
}

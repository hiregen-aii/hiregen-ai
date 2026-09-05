export interface GoldenCase {
  id: string;
  company: string;
  role: string;
  hiringType: string;
  input: string;
  expectedOutput?: string;
  expectedAttributes?: Record<string, unknown>;
}

export interface EvalResult {
  caseId: string;
  success: boolean;
  output?: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd?: number;
  error?: string;
}

export interface EvalSummary {
  totalCases: number;
  successfulCases: number;
  failedCases: number;
  averageLatencyMs: number;
  totalTokens: number;
  totalCostUsd: number;
  successRate: number;
  results: EvalResult[];
}

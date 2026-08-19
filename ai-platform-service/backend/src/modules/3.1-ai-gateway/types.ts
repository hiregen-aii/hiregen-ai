export type ProviderName = "gemini" | "groq";

export type AgentType =
  | "analytics"
  | "classification"
  | "discovery"
  | "enrichment"
  | "followup"
  | "personalization"
  | "research";

export interface AIRequest {
  agent: AgentType;
  prompt: string;
  metadata?: {
    templateId?: string;
    promptVersion?: number;
    leadId?: string;
    inputHash?: string;
  };
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AIResponse {
  provider: ProviderName;
  model: string;
  content: string;
  tokenUsage?: TokenUsage;
  responseTimeMs?: number;
}

export interface AIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
}

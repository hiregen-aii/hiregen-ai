/** Contract boundary between Prompt Engine (3.2) and AI Gateway (3.1). */
export interface AIGatewayRequest {
  agentName: string;
  prompt: string;
  metadata: {
    templateId: string;
    promptVersion: number;
  };
}

export interface AIGatewayResponse {
  output: string;
  metadata?: {
    agentName?: string;
    modelUsed?: string;
    latencyMs?: number;
    costUsd?: number;
  };
}

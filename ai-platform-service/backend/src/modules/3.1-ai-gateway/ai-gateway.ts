import { AIProvider, AIRequest, AIResponse, AgentType, ProviderName } from "./types";
import { getProviderOrder } from "./routing";
import { providers as defaultProviders } from "./providers";

export interface GatewayRunLog {
  agent: AIRequest["agent"];
  provider: string;
  model?: string;
  success: boolean;
  responseTimeMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  error?: string;
  templateId?: string;
  promptVersion?: number;
  leadId?: string;
  inputHash?: string;
}

export type GatewayLoggingHook = (log: GatewayRunLog) => void | Promise<void>;
export type ProviderRegistry = Record<ProviderName, AIProvider>;
export type ProviderOrderResolver = (agent: AgentType) => ProviderName[];

export class AIGateway {
  constructor(
    private readonly loggingHook?: GatewayLoggingHook,
    private readonly providerRegistry: ProviderRegistry = defaultProviders,
    private readonly providerOrderResolver: ProviderOrderResolver = getProviderOrder,
  ) {}

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!request.agent) throw new Error("Agent is required.");
    if (!request.prompt?.trim()) throw new Error("Prompt is required.");

    const errors: string[] = [];
    for (const providerName of this.providerOrderResolver(request.agent)) {
      const provider = this.providerRegistry[providerName];
      if (!provider) {
        const message = `${providerName}: Provider not registered.`;
        errors.push(message);
        await this.writeLog({ ...this.baseLog(request, providerName), success: false, error: message });
        continue;
      }
      try {
        const response = await provider.generate(request);
        await this.writeLog({
          ...this.baseLog(request, response.provider),
          success: true,
          model: response.model,
          responseTimeMs: response.responseTimeMs,
          inputTokens: response.tokenUsage?.inputTokens,
          outputTokens: response.tokenUsage?.outputTokens,
          totalTokens: response.tokenUsage?.totalTokens,
        });
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown provider error";
        errors.push(`${providerName}: ${message}`);
        await this.writeLog({ ...this.baseLog(request, providerName), success: false, error: message });
      }
    }
    throw new Error(["All AI providers failed.", ...errors].join("\n"));
  }

  private baseLog(request: AIRequest, provider: string) {
    return {
      agent: request.agent,
      provider,
      templateId: request.metadata?.templateId,
      promptVersion: request.metadata?.promptVersion,
      leadId: request.metadata?.leadId,
      inputHash: request.metadata?.inputHash,
    };
  }

  private async writeLog(log: GatewayRunLog): Promise<void> {
    if (!this.loggingHook) return;
    try { await this.loggingHook(log); } catch { /* logging must never break AI execution */ }
  }
}

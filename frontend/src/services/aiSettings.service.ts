import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";

export interface ProviderOption {
  id: string;
  name: string;
  defaultModel: string;
  models: string[];
  defaultBaseUrl: string;
}

export interface AiSettingsData {
  provider: string;
  model: string;
  customBaseUrl?: string;
  temperature: number;
  hasKey: boolean;
  maskedKey: string;
  availableProviders: ProviderOption[];
}

export interface UpdateAiSettingsPayload {
  provider: string;
  model: string;
  apiKey?: string;
  customBaseUrl?: string;
  temperature?: number;
}

export interface TestAiResult {
  success: boolean;
  provider: string;
  model: string;
  latencyMs: number;
  message: string;
}

export async function fetchAiSettings(): Promise<AiSettingsData> {
  try {
    const { data } = await api.get<ApiEnvelope<AiSettingsData>>("/settings/ai");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load AI provider settings"));
  }
}

export async function saveAiSettings(payload: UpdateAiSettingsPayload): Promise<AiSettingsData> {
  try {
    const { data } = await api.put<ApiEnvelope<AiSettingsData>>("/settings/ai", payload);
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to save AI provider settings"));
  }
}

export async function testAiConnection(payload: {
  provider: string;
  model: string;
  apiKey?: string;
  customBaseUrl?: string;
}): Promise<TestAiResult> {
  try {
    const { data } = await api.post<ApiEnvelope<TestAiResult>>("/settings/ai/test", payload);
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "AI connection test failed"));
  }
}

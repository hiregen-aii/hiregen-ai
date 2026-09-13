import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";

export interface AutopilotStatus {
  isEnabled: boolean;
  minFitScore: number;
  lastRunAt: string | null;
  totalDispatched: number;
}

export interface AutopilotRunResult {
  totalEligible: number;
  dispatched: number;
  failed: number;
  threshold: number;
  executedAt: string;
  errors?: Array<{ approvalId: string; leadId: string; error: string }>;
}

export async function fetchAutopilotStatus(): Promise<AutopilotStatus> {
  try {
    const { data } = await api.get<ApiEnvelope<AutopilotStatus>>("/autopilot/status");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load autopilot status"));
  }
}

export async function updateAutopilotConfig(config: { enabled: boolean; minFitScore?: number }): Promise<AutopilotStatus> {
  try {
    const { data } = await api.post<ApiEnvelope<AutopilotStatus>>("/autopilot/config", config);
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to update autopilot configuration"));
  }
}

export async function runAutopilotNow(): Promise<AutopilotRunResult> {
  try {
    const { data } = await api.post<ApiEnvelope<AutopilotRunResult>>("/autopilot/run-now", {});
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to execute autopilot batch run"));
  }
}

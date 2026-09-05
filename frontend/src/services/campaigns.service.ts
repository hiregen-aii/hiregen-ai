import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";
import type { Campaign, CampaignStatus, CreateCampaignPayload } from "@/types/campaign";

export async function fetchCampaigns(): Promise<Campaign[]> {
  try {
    const { data } = await api.get<ApiEnvelope<Campaign[]>>("/campaigns");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load campaigns"));
  }
}

export async function createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
  try {
    const { data } = await api.post<ApiEnvelope<Campaign>>("/campaigns", payload);
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to create campaign"));
  }
}

export async function updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
  try {
    const { data } = await api.patch<ApiEnvelope<Campaign>>(`/campaigns/${id}`, { status });
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to update campaign"));
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  try {
    await api.delete(`/campaigns/${id}`);
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to delete campaign"));
  }
}
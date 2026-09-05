import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";
import type { Lead, LeadStage } from "@/types/lead";

// POST /api/v1/leads — ADMIN, MANAGER only (see backend/src/routes/leads.routes.js)
export interface CreateLeadPayload {
  hiringSignalId: string;
  companyId: string;
  primaryContactId?: string | null;
  ownerId?: string | null;
  stage?: LeadStage;
  hiringType?: string | null;
  fitScore?: number;
}

export async function createLead(payload: CreateLeadPayload): Promise<Lead> {
  try {
    const { data } = await api.post<ApiEnvelope<Lead>>("/leads", payload);
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to create lead"));
  }
}

// PATCH /api/v1/leads/:id — ADMIN, MANAGER, SALES_REP
// Backend only updates fields you actually send — at least one required.
export interface UpdateLeadPayload {
  stage?: LeadStage;
  ownerId?: string;
  fitScore?: number;
}

export async function updateLead(id: string, payload: UpdateLeadPayload): Promise<Lead> {
  try {
    const { data } = await api.patch<ApiEnvelope<Lead>>(`/leads/${id}`, payload);
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to update lead"));
  }
}

// POST /api/v1/leads/:id/research — ADMIN, MANAGER, SALES_REP
// Can legitimately fail with 422 (AI Gateway down, no verifiable sources) —
// that's a normal outcome, not a bug, so callers should show the message
// rather than treat it as a hard crash.
export async function triggerResearch(id: string): Promise<unknown> {
  try {
    const { data } = await api.post<ApiEnvelope<unknown>>(`/leads/${id}/research`);
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Research request failed"));
  }
}
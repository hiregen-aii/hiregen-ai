import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";
import type { Approval, ApprovalStatus } from "@/types/approval";

// GET /api/v1/approval — open to all roles
export async function fetchApprovals(): Promise<Approval[]> {
  try {
    const { data } = await api.get<ApiEnvelope<Approval[]>>("/approval");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load approvals"));
  }
}

// PATCH /api/v1/approval/:id/status — ADMIN, MANAGER only
export async function updateApprovalStatus(id: string, status: ApprovalStatus): Promise<Approval> {
  try {
    const { data } = await api.patch<ApiEnvelope<Approval>>(`/approval/${id}/status`, { status });
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to update approval"));
  }
}
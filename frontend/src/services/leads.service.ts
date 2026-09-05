import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";
import type { Lead } from "@/types/lead";

// GET /api/v1/leads — open to ADMIN, MANAGER, SALES_REP, RECRUITER, VIEWER
// (see backend/src/routes/leads.routes.js). Every logged-in role can call this.
export async function fetchLeads(): Promise<Lead[]> {
  try {
    const { data } = await api.get<ApiEnvelope<Lead[]>>("/leads");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load leads"));
  }
}
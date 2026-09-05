import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";
import type { CompanyRef } from "@/types/lead-refs";

// GET /api/v1/companies — open to all roles (see backend/src/routes/companies.routes.js)
export async function fetchCompanies(): Promise<CompanyRef[]> {
  try {
    const { data } = await api.get<ApiEnvelope<CompanyRef[]>>("/companies");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load companies"));
  }
}
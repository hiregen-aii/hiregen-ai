import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";
import type { CompanyProfile, TimelineEvent } from "@/types/company-profile";

// GET /api/v1/companies — same endpoint the Leads page's lightweight
// CompanyRef hook uses, just typed with the full real shape here.
export async function fetchCompanyProfiles(): Promise<CompanyProfile[]> {
  try {
    const { data } = await api.get<ApiEnvelope<CompanyProfile[]>>("/companies");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load companies"));
  }
}

// GET /api/v1/companies/:id/timeline
export async function fetchCompanyTimeline(companyId: string): Promise<TimelineEvent[]> {
  try {
    const { data } = await api.get<ApiEnvelope<{ companyId: string; events: TimelineEvent[] }>>(
      `/companies/${companyId}/timeline`
    );
    return data.data.events;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load company timeline"));
  }
}
import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";
import type { AnalyticsDaily, AnalyticsMonthly } from "@/types/analytics";

export async function fetchDailyAnalytics(): Promise<AnalyticsDaily[]> {
  try {
    const { data } = await api.get<ApiEnvelope<AnalyticsDaily[]>>("/analytics/daily");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load daily analytics"));
  }
}

export async function fetchMonthlyAnalytics(): Promise<AnalyticsMonthly[]> {
  try {
    const { data } = await api.get<ApiEnvelope<AnalyticsMonthly[]>>("/analytics/monthly");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load monthly analytics"));
  }
}
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

export interface RawTeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  leads_managed: number;
  emails_sent: number;
  meetings_booked: number;
  conversion_rate: number;
}

import type { TeamPerformance } from "@/types/analytics";

export async function fetchTeamPerformance(): Promise<TeamPerformance[]> {
  try {
    const { data } = await api.get<ApiEnvelope<RawTeamMember[]>>("/analytics/team");
    return (data.data || []).map((m, idx) => {
      const parts = (m.name || "Team Member").trim().split(/\s+/);
      const initials = parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : (parts[0]?.slice(0, 2).toUpperCase() || "TM");

      return {
        id: idx + 1,
        rep: m.name,
        avatar: initials,
        leads: m.leads_managed,
        replyRate: m.conversion_rate,
        meetings: m.meetings_booked,
        wins: Math.max(0, Math.floor(m.meetings_booked * 0.7)),
        trend: m.conversion_rate >= 10 ? "up" : "down",
      };
    });
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load team performance"));
  }
}
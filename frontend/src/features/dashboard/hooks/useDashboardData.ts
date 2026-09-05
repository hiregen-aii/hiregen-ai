import { useMemo } from "react";
import { useLeads } from "@/hooks/useLeads";
import { useHiringSignalsCount } from "@/hooks/useHiringSignalsCount";
import type { Lead, HiringType } from "@/types/lead";

export interface DashboardStat {
  title: string;
  value: string;
  color: string;
  available: boolean;
}

function computeFunnel(leads: Lead[]) {
  const total = leads.length;
  const qualified = leads.filter((l) => l.stage !== "NEW").length;
  const contacted = leads.filter((l) =>
    ["SENT", "REPLIED", "MEETING_BOOKED", "WON"].includes(l.stage)
  ).length;
  const meetings = leads.filter((l) => ["MEETING_BOOKED", "WON"].includes(l.stage)).length;
  const closed = leads.filter((l) => l.stage === "WON").length;

  const pct = (n: number) => (total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`);

  return [
    { label: "Leads", value: total, width: "100%", color: "#7C3AED" },
    { label: "Qualified", value: qualified, width: pct(qualified), color: "#3B82F6" },
    { label: "Contacted", value: contacted, width: pct(contacted), color: "#8B5CF6" },
    { label: "Meetings", value: meetings, width: pct(meetings), color: "#22C55E" },
    { label: "Closed", value: closed, width: pct(closed), color: "#F59E0B" },
  ];
}

function computeHiringTypeSplit(leads: Lead[]) {
  const withType = leads.filter((l): l is Lead & { hiring_type: HiringType } => l.hiring_type !== null);
  const total = withType.length;
  const colors: Record<HiringType, string> = {
    FULL_TIME: "#7C3AED",
    CONTRACT: "#3B82F6",
    INTERN: "#22C55E",
    BULK_HIRING: "#F59E0B",
    CAMPUS_DRIVE: "#EC4899",
  };
  const labels: Record<HiringType, string> = {
    FULL_TIME: "Full Time",
    CONTRACT: "Contract",
    INTERN: "Internship",
    BULK_HIRING: "Bulk Hiring",
    CAMPUS_DRIVE: "Campus Drive",
  };

  const counts = withType.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.hiring_type] = (acc[lead.hiring_type] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total,
    data: Object.entries(counts).map(([type, count]) => ({
      name: labels[type as HiringType],
      value: total === 0 ? 0 : Math.round((count / total) * 100),
      color: colors[type as HiringType],
    })),
  };
}

export function useDashboardData() {
  const leadsQuery = useLeads();
  const signalsQuery = useHiringSignalsCount();

  const leads = leadsQuery.data ?? [];

  const stats: DashboardStat[] = useMemo(
    () => [
      {
        title: "Hiring Signals",
        value: signalsQuery.data !== undefined ? String(signalsQuery.data) : "—",
        color: "#7C3AED",
        available: signalsQuery.data !== undefined,
      },
      { title: "Leads Generated", value: String(leads.length), color: "#3B82F6", available: true },
      {
        title: "Emails Sent",
        value: String(leads.filter((l) => ["SENT", "REPLIED", "MEETING_BOOKED", "WON"].includes(l.stage)).length),
        color: "#8B5CF6",
        available: true,
      },
      {
        title: "Replies Received",
        value: String(leads.filter((l) => ["REPLIED", "MEETING_BOOKED", "WON"].includes(l.stage)).length),
        color: "#22C55E",
        available: true,
      },
      {
        title: "Meetings Booked",
        value: String(leads.filter((l) => ["MEETING_BOOKED", "WON"].includes(l.stage)).length),
        color: "#F59E0B",
        available: true,
      },
      {
        title: "Conversion Rate",
        value: leads.length === 0 ? "0%" : `${Math.round((leads.filter((l) => l.stage === "WON").length / leads.length) * 100)}%`,
        color: "#EC4899",
        available: true,
      },
    ],
    [leads, signalsQuery.data]
  );

  return {
    isLoading: leadsQuery.isLoading,
    isError: leadsQuery.isError,
    error: leadsQuery.error,
    stats,
    funnel: useMemo(() => computeFunnel(leads), [leads]),
    hiringType: useMemo(() => computeHiringTypeSplit(leads), [leads]),
  };
}
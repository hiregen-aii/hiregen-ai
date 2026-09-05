// Mirrors `analytics_daily` / `analytics_monthly` tables exactly.

export interface AnalyticsDaily {
  id: string;
  report_date: string;
  total_leads: number;
  emails_sent: number;
  meetings_booked: number;
}

export interface AnalyticsMonthly {
  id: string;
  report_month: string;
  total_leads: number;
  emails_sent: number;
  meetings_booked: number;
}

export type HiringType =
  | "All"
  | "Full Time"
  | "Contract"
  | "Bulk Hiring"
  | "Intern"
  | "Campus Drive";

export type LeadStage =
  | "All"
  | "Signal"
  | "Lead"
  | "Sent"
  | "Replied"
  | "Meeting"
  | "Won";

export interface AnalyticsFilters {
  hiringType: HiringType;
  leadStage: LeadStage;
  owner: string;
  source: string;
  campaign: string;
}

export interface AnalyticsStat {
  id: number;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  color: string;
  icon: string;
}

export interface FunnelStage {
  stage: string;
  value: number;
  color: string;
}

export interface WorkflowSignal {
  id: string | number;
  company: string;
  role: string;
  health: number;
  status: "healthy" | "retrying" | "failed" | "Healthy" | "Failed" | "Retrying";
  time?: string;
  updated?: string;
}

export interface HiringTypeMix {
  name: string;
  value: number;
  color: string;
}

export interface TeamPerformance {
  id: number;
  rep: string;
  avatar: string;
  leads: number;
  replyRate: number;
  meetings: number;
  wins: number;
  trend: "up" | "down";
}

export interface AnalyticsExportOption {
  type: "CSV" | "Excel" | "PDF";
}
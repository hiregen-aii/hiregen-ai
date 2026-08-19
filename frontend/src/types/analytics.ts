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
  id: string;
  company: string;
  role: string;
  health: number;
  status: "healthy" | "retrying" | "failed";
  time: string;
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
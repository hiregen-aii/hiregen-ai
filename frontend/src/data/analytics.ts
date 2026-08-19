import type {
  AnalyticsStat,
  FunnelStage,
  WorkflowSignal,
  HiringTypeMix,
  TeamPerformance,
} from "@/types/analytics";

export const analyticsStats: AnalyticsStat[] = [
  {
    id: 1,
    title: "Hiring Signals",
    value: "2.5K",
    change: "+5.9%",
    trend: "up",
    color: "#7C3AED",
    icon: "signal",
  },
  {
    id: 2,
    title: "Signal → Lead Time",
    value: "1.3h",
    change: "+7.3%",
    trend: "up",
    color: "#2563EB",
    icon: "timer",
  },
  {
    id: 3,
    title: "HR Match Rate",
    value: "82.1%",
    change: "+2.1%",
    trend: "up",
    color: "#16A34A",
    icon: "users",
  },
  {
    id: 4,
    title: "Research Completion",
    value: "43m",
    change: "-14.9%",
    trend: "down",
    color: "#F97316",
    icon: "search",
  },
  {
    id: 5,
    title: "Email Delivery",
    value: "90.4%",
    change: "+2.7%",
    trend: "up",
    color: "#7C3AED",
    icon: "send",
  },
  {
    id: 6,
    title: "Email Open Rate",
    value: "61.3%",
    change: "-1.6%",
    trend: "down",
    color: "#3B82F6",
    icon: "mail",
  },
  {
    id: 7,
    title: "Email Reply Rate",
    value: "18.9%",
    change: "-1.5%",
    trend: "down",
    color: "#22C55E",
    icon: "reply",
  },
  {
    id: 8,
    title: "Meeting Booking",
    value: "41.4%",
    change: "+7.5%",
    trend: "up",
    color: "#8B5CF6",
    icon: "calendar",
  },
  {
    id: 9,
    title: "Lead → Client",
    value: "2.8%",
    change: "0%",
    trend: "up",
    color: "#10B981",
    icon: "trophy",
  },
  {
    id: 10,
    title: "Workflow Failure",
    value: "2.8%",
    change: "-9.5%",
    trend: "down",
    color: "#EF4444",
    icon: "alert",
  },
];

export const funnelData: FunnelStage[] = [
  {
    stage: "Signal",
    value: 2500,
    color: "#7C3AED",
  },
  {
    stage: "Lead",
    value: 1600,
    color: "#6366F1",
  },
  {
    stage: "Sent",
    value: 1400,
    color: "#3B82F6",
  },
  {
    stage: "Replied",
    value: 266,
    color: "#10B981",
  },
  {
    stage: "Meeting",
    value: 110,
    color: "#F59E0B",
  },
  {
    stage: "Won",
    value: 44,
    color: "#059669",
  },
];

export const workflowSignals: WorkflowSignal[] = [
  {
    id: "1",
    company: "Databricks",
    role: "VP Engineering",
    health: 91,
    status: "healthy",
    time: "Just now",
  },
  {
    id: "2",
    company: "Stripe",
    role: "Senior Recruiter",
    health: 98,
    status: "healthy",
    time: "2 min ago",
  },
  {
    id: "3",
    company: "Snowflake",
    role: "Senior Recruiter",
    health: 92,
    status: "healthy",
    time: "1 min ago",
  },
  {
    id: "4",
    company: "Figma",
    role: "HRBP",
    health: 91,
    status: "healthy",
    time: "2 min ago",
  },
  {
    id: "5",
    company: "HR Contact Enrichment",
    role: "Workflow",
    health: 0,
    status: "failed",
    time: "12 min ago",
  },
  {
    id: "6",
    company: "Outreach Send Queue",
    role: "SMTP",
    health: 45,
    status: "retrying",
    time: "55 min ago",
  },
];

export const hiringTypeMix: HiringTypeMix[] = [
  {
    name: "Full Time",
    value: 42,
    color: "#7C3AED",
  },
  {
    name: "Contract",
    value: 17.1,
    color: "#3B82F6",
  },
  {
    name: "Bulk Hiring",
    value: 23.5,
    color: "#10B981",
  },
  {
    name: "Intern",
    value: 9.6,
    color: "#8B5CF6",
  },
  {
    name: "Campus Drive",
    value: 7.7,
    color: "#F59E0B",
  },
];

export const teamPerformance: TeamPerformance[] = [
  {
    id: 1,
    rep: "Sara Kim",
    avatar: "SK",
    leads: 144,
    replyRate: 30.1,
    meetings: 20,
    wins: 7,
    trend: "up",
  },
  {
    id: 2,
    rep: "Robert Wilson",
    avatar: "RW",
    leads: 194,
    replyRate: 27.7,
    meetings: 21,
    wins: 7,
    trend: "down",
  },
  {
    id: 3,
    rep: "Daniel Ortiz",
    avatar: "DO",
    leads: 137,
    replyRate: 27.9,
    meetings: 13,
    wins: 5,
    trend: "down",
  },
  {
    id: 4,
    rep: "Ananya Rao",
    avatar: "AR",
    leads: 129,
    replyRate: 34.8,
    meetings: 15,
    wins: 4,
    trend: "up",
  },
  {
    id: 5,
    rep: "Marcus Chen",
    avatar: "MC",
    leads: 152,
    replyRate: 20.3,
    meetings: 12,
    wins: 3,
    trend: "up",
  },
];

export const hiringTypeOptions = [
  "All",
  "Full Time",
  "Contract",
  "Bulk Hiring",
  "Intern",
  "Campus Drive",
] as const;

export const leadStageOptions = [
  "All",
  "Signal",
  "Lead",
  "Sent",
  "Replied",
  "Meeting",
  "Won",
] as const;

export const ownerOptions = [
  "All",
  "Sara Kim",
  "Robert Wilson",
  "Daniel Ortiz",
  "Ananya Rao",
  "Marcus Chen",
] as const;

export const sourceOptions = [
  "All",
  "LinkedIn",
  "Apollo",
  "Clay",
  "Website",
  "Referral",
] as const;

export const campaignOptions = [
  "All",
  "Q3 Engineering Hiring",
  "Campus Drive",
  "Enterprise Hiring",
  "Contract Hiring",
  "Bulk Hiring",
] as const;
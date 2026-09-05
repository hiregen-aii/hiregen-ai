import type {
  Campaign,
  CampaignStats,
} from "@/types/campaign";

export const campaignStats: CampaignStats = {
  activeSequences: 2,
  paused: 1,
  totalCampaigns: 3,
  leadsEnrolled: 276,
  averageReplyRate: 15.7,
};

export const campaignsData: Campaign[] = [
  {
    id: 1,

    name: "Q3 Software Engineering Intern Blitz",

    status: "Active",

    hiringType: "Intern",

    template: "Intern Sourcing - Direct Outreach",

    steps: 3,

    delay: 3,

    enrolled: 142,

    openRate: 68.4,

    replyRate: 22.1,

    createdAt: "21 Jul 2026",

    approvalRequired: true,
  },

  {
    id: 2,

    name: "Enterprise Bulk Hiring Drive - Q3",

    status: "Active",

    hiringType: "Bulk Hiring",

    template: "Bulk Talent Supply Solution",

    steps: 4,

    delay: 2,

    enrolled: 89,

    openRate: 54.2,

    replyRate: 15.8,

    createdAt: "20 Jul 2026",

    approvalRequired: true,
  },

  {
    id: 3,

    name: "Senior Full-Stack Contract Scale",

    status: "Paused",

    hiringType: "Contract",

    template: "Contract Talent Augmentation",

    steps: 3,

    delay: 4,

    enrolled: 45,

    openRate: 41.0,

    replyRate: 9.3,

    createdAt: "19 Jul 2026",

    approvalRequired: false,
  },
];

export const hiringTypes = [
  "All",
  "Intern",
  "Full Time",
  "Contract",
  "Bulk Hiring",
  "Campus Drive",
] as const;

export const campaignStatuses = [
  "All",
  "Active",
  "Paused",
  "Completed",
] as const;

export const campaignTemplates = [
  "Standard Tech Pitch",
  "Intern Sourcing - Direct Outreach",
  "Bulk Talent Supply Solution",
  "Contract Talent Augmentation",
  "Campus Hiring Sequence",
  "Executive Hiring Campaign",
];
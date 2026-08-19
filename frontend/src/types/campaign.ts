export type CampaignStatus =
  | "Active"
  | "Paused"
  | "Completed";

export type HiringType =
  | "Intern"
  | "Full Time"
  | "Contract"
  | "Bulk Hiring"
  | "Campus Drive";

export interface Campaign {
  id: number;

  name: string;

  status: CampaignStatus;

  hiringType: HiringType;

  template: string;

  steps: number;

  delay: number;

  enrolled: number;

  openRate: number;

  replyRate: number;

  createdAt: string;

  approvalRequired: boolean;
}

export interface CampaignStats {
  activeSequences: number;
  paused: number;
  totalCampaigns: number;
  leadsEnrolled: number;
  averageReplyRate: number;
}

export interface CampaignFormData {
  name: string;

  hiringType: HiringType;

  template: string;

  steps: number;

  delay: number;

  approvalRequired: boolean;
}

export interface CampaignFilter {
  search: string;

  status: "All" | CampaignStatus;

  hiringType:
    | "All"
    | HiringType;
}
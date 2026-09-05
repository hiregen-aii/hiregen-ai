// Mirrors `campaigns` table while providing full compatibility for dashboard UI components.

export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "ARCHIVED"
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
  id: string | number;
  name: string;
  status: CampaignStatus;
  hiring_type?: string | null;
  template_reference?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;

  // UI / mock backwards-compatibility fields:
  hiringType?: HiringType | string;
  template?: string;
  steps?: number;
  delay?: number;
  enrolled?: number;
  openRate?: number;
  replyRate?: number;
  createdAt?: string;
  approvalRequired?: boolean;
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
  hiringType: "All" | HiringType;
}

export interface CreateCampaignPayload {
  name: string;
  hiringType?: string;
  templateReference?: string;
  isActive?: boolean;
  status?: CampaignStatus;
}
// Mirrors `campaigns` table exactly — see backend/migrations.
// NOTE: real schema has NO enrolled/openRate/replyRate columns — those
// would need email-tracking data joined in, not available yet.

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";

export interface Campaign {
  id: string;
  name: string;
  hiring_type: string | null;
  template_reference: string | null;
  is_active: boolean;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignPayload {
  name: string;
  hiringType?: string;
  templateReference?: string;
  isActive?: boolean;
  status?: CampaignStatus;
}
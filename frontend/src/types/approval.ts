// Mirrors `approval_queue` table exactly — see backend/migrations.

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Approval {
  id: string;
  lead_id: string;
  draft_subject: string;
  draft_body: string;
  status: ApprovalStatus;
  step_number: number;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}
// Mirrors `leads` table exactly — see backend/migrations/001_create_core_schema.sql.
// Repository does `SELECT * FROM leads` with NO joins, so this is genuinely
// everything the API gives you: ids only, no company/contact/owner names.

export type LeadStage =
  | "NEW"
  | "RESEARCHED"
  | "OUTREACH_DRAFTED"
  | "APPROVED"
  | "SENT"
  | "REPLIED"
  | "MEETING_BOOKED"
  | "WON"
  | "LOST";

export type HiringType = "INTERN" | "FULL_TIME" | "CONTRACT" | "BULK_HIRING" | "CAMPUS_DRIVE";

export interface Lead {
  id: string;
  hiring_signal_id: string;
  company_id: string;
  primary_contact_id: string | null;
  owner_id: string | null;
  stage: LeadStage;
  hiring_type: HiringType | null;
  fit_score: number;
  created_at: string;
  updated_at: string;
}
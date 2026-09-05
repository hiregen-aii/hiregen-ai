// Full real shape of a row from `companies` — see backend/migrations.
// Distinct from types/lead-refs.ts's lightweight CompanyRef (used only
// for the Leads table join) and from the old mock types/company.ts
// (used by the pre-existing, backend-less Company Profile components —
// left untouched to avoid breaking whatever still imports it).

export interface CompanyProfile {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size_range: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

// GET /api/v1/companies/:id/timeline — real, aggregated from emails,
// meetings, AI agent runs, hiring signals, and research completions
// for every lead tied to this company.
export interface TimelineEvent {
  source: "email" | "meeting" | "agent_run" | "hiring_signal" | "research";
  event_type: string;
  occurred_at: string;
  related_id: string | null;
  detail: Record<string, unknown>;
}
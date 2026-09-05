/**
 * Job payload & result contracts for every queue in Module 4.2.
 *
 * IMPORTANT: field names below match exactly what each module owner
 * provided, including casing (e.g. snake_case for audit_log because
 * those are literal Postgres column names, camelCase everywhere else).
 * Do not "clean up" the casing - downstream code depends on it matching.
 *
 * Each block below is labeled CONFIRMED (a real module owner gave us
 * this exact shape) or MOCKED (no real contract exists yet - built as
 * a placeholder so this module isn't blocked; swap in the real shape
 * once it's available, without changing the exported type/function
 * names other files import).
 */

// ---------------------------------------------------------------------------
// AUDIT LOG - CONFIRMED (source: Anuj Mishra, Team 1, Module 1.4/1.5,
// AuditL.docx - matches the audit_log Postgres table exactly)
// ---------------------------------------------------------------------------
export interface AuditLogJobPayload {
  user_id: string | null; // UUID, FK users.id - NULL is expected for background/system jobs
  action: string; // required, e.g. 'CREATE' | 'UPDATE' | 'DELETE' | 'LEAD_STAGE_UPDATED'
  entity_name: string; // required, e.g. 'leads' | 'campaigns' | 'companies' | 'users'
  entity_id?: string | null; // UUID
  before_snapshot?: Record<string, unknown> | null; // JSONB - null on creation events
  after_snapshot?: Record<string, unknown> | null; // JSONB - null on deletion events
  // Do NOT include id or created_at here - Postgres auto-generates both.
}

// ---------------------------------------------------------------------------
// EMAIL SEND - CONFIRMED (source: Vignesh Reddy, Team 4, Module 4.3)
// Vignesh said he's open to adding fields - re-check this shape with him
// before this queue goes fully live.
// ---------------------------------------------------------------------------
export interface EmailSendJobPayload {
  recipient: string;
  subject: string;
  body: string;
  templateId?: string;
}

// ---------------------------------------------------------------------------
// ENRICHMENT - MOCKED. Team 2 (Gauri's Enrichment Agent) has not confirmed
// the real input/output shape yet. There is also an open, unresolved
// question on whether the agent is Python (per SRS) or Node.js (per the
// team's own task sheet) - confirm with Gauri before wiring this for real.
// ---------------------------------------------------------------------------
export interface EnrichmentJobPayload {
  companyId: string;
  companyName: string;
}

export interface EnrichmentJobResult {
  companyId: string;
  industry?: string;
  sizeRange?: string;
  linkedinUrl?: string;
  enrichedAt: string;
}

// ---------------------------------------------------------------------------
// RESEARCH - MOCKED. No real contract provided yet by Team 2's Research
// Engine (Arpita Pancholi, Module 2.4). Ask her for the real shape when
// she's ready; keep this function signature stable in the meantime.
// ---------------------------------------------------------------------------
export interface ResearchJobPayload {
  companyId: string;
  companyName: string;
}

export interface ResearchJobResult {
  companyId: string;
  summary: string;
  sourceUrls: string[];
  completedAt: string;
}

// ---------------------------------------------------------------------------
// CLASSIFICATION - PARTIALLY CONFIRMED. The *input trigger* is mocked
// (nobody has confirmed what kicks this job off yet, since Team 2 says
// scoring currently happens synchronously, not via a queue). The
// *result* shape is CONFIRMED - it matches Kanduru Rakshitha's
// (Module 2.5, Lead Management) payload exactly, field for field.
// ---------------------------------------------------------------------------
export interface ClassificationJobPayload {
  hiringSignalId: string;
  companyId: string;
}

export interface ClassificationJobResult {
  leadId: string;
  companyId: string;
  hiringSignalId: string;
  primaryContactId: string;
  hiringType: string; // e.g. 'FULL_TIME'
  fitScore: number;
  urgency: string; // e.g. 'HIGH'
  stage: string; // e.g. 'RESEARCHED'
  ownerId: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// PERSONALIZATION - MOCKED. No real contract provided yet by Team 3
// (Ansh Choudhary / Vatsal Goel, Module 3.4). Confirm before go-live.
// ---------------------------------------------------------------------------
export interface PersonalizationJobPayload {
  leadId: string;
  companyId: string;
  hiringType: string;
}

export interface PersonalizationJobResult {
  leadId: string;
  draftSubject: string;
  draftBody: string;
  generatedAt: string;
}

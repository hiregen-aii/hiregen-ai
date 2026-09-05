-- Fix: hiring_signals table was missing updated_at, but migration 002's
-- trigger loop and hiringSignals.repository.js both try to set it on every
-- UPDATE. Without this column, any status transition (NEW -> ENRICHING ->
-- RESEARCHED -> QUALIFIED/REJECTED) throws:
--   "record NEW has no field updated_at"
-- This blocks the entire discovery -> enrichment -> research -> classification
-- pipeline. Additive-only migration — does not touch 001/002.

ALTER TABLE hiring_signals
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Fix: leads table was missing the "urgency" column. SRS §7/§8 explicitly
-- says the Classification Agent sets hiring_type, urgency, and fit_score
-- on leads — but only hiring_type/fit_score made it into 001's schema.
-- repositories/leads.repository.js already has updateLeadUrgency(), which
-- would fail with "column urgency does not exist" without this.
ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS urgency VARCHAR(20)
        CHECK (urgency IS NULL OR urgency IN ('LOW', 'MEDIUM', 'HIGH'));

-- Fix: company_memory.memory was TEXT, but SRS §11 specifies a structured
-- JSONB record (prior signals, prior outreach, contact preferences,
-- sentiment history, hiring pattern) so agents can read/update individual
-- fields instead of overwriting one plain-text blob. Existing text values
-- (if any) are preserved as JSON string scalars via to_jsonb(), so this is
-- non-destructive.
-- NOTE: this migration is only safe together with the matching change in
-- repositories/companyMemory.repository.js (below), which now writes/reads
-- JSON objects instead of a plain string — the two must ship together.
ALTER TABLE company_memory
    ALTER COLUMN memory TYPE JSONB USING to_jsonb(memory);
ALTER TABLE company_memory
    ALTER COLUMN memory SET DEFAULT '{}'::jsonb;

-- Fix: company_research had no uniqueness guarantee on company_id, so two
-- concurrent research calls for the same company could both INSERT instead
-- of the second one UPDATEing — flagged by Arpita in research.agent.js
-- comments. This constraint + the repository's ON CONFLICT (see
-- companyResearch.repository.js) closes that race.
ALTER TABLE company_research
    ADD CONSTRAINT company_research_company_id_key UNIQUE (company_id);

-- Team 2 <-> Team 3 schema alignment (AI Memory, module 3.3 / 2.2-2.3
-- cross-listed).
--
-- Team 3's memory.repository.ts was built against a company_memory schema
-- that has a `version` column (for optimistic-concurrency-controlled
-- updates: "UPDATE ... WHERE company_id = $2 AND version = $3") and 3
-- supporting tables (memory_events, conversation_history,
-- interaction_history) that don't exist in our schema. Without this
-- migration, every one of Team 3's update/append/timeline calls would
-- either throw "column version does not exist" or "relation ... does not
-- exist".
--
-- This is additive only — nothing here removes or changes the meaning of
-- what Team 2's code already reads/writes on company_memory.memory.

-- 1. Add version column for optimistic locking.
ALTER TABLE company_memory
    ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- 2. memory_events — audit log of everything that touched a company's memory.
CREATE TABLE IF NOT EXISTS memory_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_memory_events_company_id ON memory_events(company_id);
CREATE INDEX IF NOT EXISTS idx_memory_events_occurred_at ON memory_events(occurred_at);

-- 3. conversation_history — actual message exchanges.
DO $$ BEGIN
    CREATE TYPE conversation_channel AS ENUM ('EMAIL', 'LINKEDIN', 'WHATSAPP');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE message_direction AS ENUM ('INBOUND', 'OUTBOUND');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS conversation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    channel conversation_channel NOT NULL,
    direction message_direction NOT NULL,
    sender_identity TEXT NOT NULL,
    recipient_identity TEXT NOT NULL,
    subject TEXT,
    body_text TEXT NOT NULL,
    message_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversation_history_company_id ON conversation_history(company_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_lead_id ON conversation_history(lead_id);

-- 4. interaction_history — lighter-weight touchpoints.
CREATE TABLE IF NOT EXISTS interaction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    interaction_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interaction_history_company_id ON interaction_history(company_id);
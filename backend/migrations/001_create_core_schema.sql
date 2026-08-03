-- Migration 001: core schema for HireGen AI security and workflow entities.
-- This file is designed to run on a blank PostgreSQL database and be re-runnable in CI.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('ADMIN','MANAGER','SALES_REP','RECRUITER','VIEWER');
CREATE TYPE hiring_type AS ENUM ('INTERN','FULL_TIME','CONTRACT','BULK_HIRING','CAMPUS_DRIVE');
CREATE TYPE signal_status AS ENUM ('NEW','ENRICHING','RESEARCHED','QUALIFIED','REJECTED');
CREATE TYPE lead_stage AS ENUM ('NEW','RESEARCHED','OUTREACH_DRAFTED','APPROVED','SENT','REPLIED','MEETING_BOOKED','WON','LOST');
CREATE TYPE approval_status AS ENUM ('PENDING','APPROVED','REJECTED');
CREATE TYPE campaign_status AS ENUM ('DRAFT','ACTIVE','PAUSED','ARCHIVED');
CREATE TYPE workflow_status AS ENUM ('QUEUED','RUNNING','SUCCEEDED','FAILED');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    normalized_email TEXT GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'SALES_REP',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_email_unique UNIQUE (normalized_email)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT refresh_tokens_hash_unique UNIQUE (token_hash)
);

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(255),
    size_range VARCHAR(50),
    linkedin_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT companies_domain_unique UNIQUE (domain)
);

CREATE TABLE IF NOT EXISTS hiring_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    role_title VARCHAR(255),
    hiring_type hiring_type,
    raw_payload JSONB,
    dedupe_key TEXT NOT NULL,
    status signal_status NOT NULL DEFAULT 'NEW',
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT hiring_signals_dedupe_unique UNIQUE (dedupe_key)
);

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    full_name VARCHAR(255),
    title VARCHAR(255),
    email VARCHAR(255),
    normalized_email TEXT GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,
    linkedin_url TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT contacts_email_unique UNIQUE (normalized_email)
);

CREATE TABLE IF NOT EXISTS company_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    summary TEXT,
    source_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    model_used VARCHAR(100),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT company_research_source_urls_array CHECK (jsonb_typeof(source_urls) = 'array')
);

CREATE TABLE IF NOT EXISTS company_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    memory TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    hiring_type hiring_type,
    template_reference TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status campaign_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT campaigns_active_flag CHECK (is_active IN (TRUE, FALSE))
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hiring_signal_id UUID NOT NULL UNIQUE REFERENCES hiring_signals(id) ON DELETE RESTRICT,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    stage lead_stage NOT NULL DEFAULT 'NEW',
    hiring_type hiring_type,
    fit_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT leads_fit_score_range CHECK (fit_score >= 0 AND fit_score <= 100)
);

CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    meeting_time TIMESTAMPTZ NOT NULL,
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    draft_subject TEXT NOT NULL,
    draft_body TEXT NOT NULL,
    status approval_status NOT NULL DEFAULT 'PENDING',
    step_number INTEGER NOT NULL DEFAULT 1,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT approval_queue_step_number CHECK (step_number >= 1)
);

CREATE TABLE IF NOT EXISTS email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    provider_message_id VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    workflow_name VARCHAR(255) NOT NULL,
    status workflow_status NOT NULL DEFAULT 'QUEUED',
    n8n_execution_id VARCHAR(255),
    error_detail TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    agent_name VARCHAR(255) NOT NULL,
    input_data JSONB NOT NULL,
    input_hash TEXT,
    model VARCHAR(100),
    output_data JSONB,
    output_reference TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    latency_ms INTEGER,
    cost_usd NUMERIC(12,6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT agent_runs_latency_nonnegative CHECK (latency_ms IS NULL OR latency_ms >= 0),
    CONSTRAINT agent_runs_cost_nonnegative CHECK (cost_usd IS NULL OR cost_usd >= 0)
);

CREATE TABLE IF NOT EXISTS analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL,
    total_leads INTEGER NOT NULL DEFAULT 0,
    emails_sent INTEGER NOT NULL DEFAULT 0,
    meetings_booked INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT analytics_daily_date_unique UNIQUE (report_date)
);

CREATE TABLE IF NOT EXISTS analytics_monthly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_month DATE NOT NULL,
    total_leads INTEGER NOT NULL DEFAULT 0,
    emails_sent INTEGER NOT NULL DEFAULT 0,
    meetings_booked INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT analytics_monthly_month_unique UNIQUE (report_month)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID,
    before_snapshot JSONB,
    after_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

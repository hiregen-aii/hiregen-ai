-- Migration 002: indexes and triggers for production operations.

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens(revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_lookup ON refresh_tokens(token_hash, revoked, expires_at);

CREATE INDEX IF NOT EXISTS idx_hiring_signals_status ON hiring_signals(status);
CREATE INDEX IF NOT EXISTS idx_hiring_signals_company ON hiring_signals(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_normalized_email ON contacts(normalized_email);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_meetings_lead ON meetings(lead_id, meeting_time);
CREATE INDEX IF NOT EXISTS idx_approval_status_created ON approval_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_email_events_lead_type_time ON email_events(lead_id, event_type, event_time);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status_started ON workflow_runs(status, started_at);
CREATE INDEX IF NOT EXISTS idx_agent_runs_lead_status ON agent_runs(lead_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_status_active ON campaigns(status, is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(report_date);
CREATE INDEX IF NOT EXISTS idx_analytics_monthly_month ON analytics_monthly(report_month);
CREATE INDEX IF NOT EXISTS idx_company_memory_company ON company_memory(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN (
              'users','refresh_tokens','companies','contacts','company_research','company_memory','campaigns','leads','meetings','approval_queue','email_events','workflow_runs','agent_runs','analytics_daily','analytics_monthly','hiring_signals'
          )
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION set_updated_at()',
            r.table_name,
            r.table_name
        );
    END LOOP;
END $$;

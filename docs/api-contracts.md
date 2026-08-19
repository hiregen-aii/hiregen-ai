API Contracts — Source of Truth

Any team changing a shared endpoint or table schema MUST update this file and notify the consuming team(s) BEFORE opening the PR — not after.

Standard response envelope (all endpoints):

json
{ "success": true, "data": {}, "error": null, "meta": { "requestId": "..." } }

All service-to-service endpoints (n8n webhooks) authenticate via a rotating API key + HMAC signature on the payload — never open/unauthenticated.

Team 1 — Platform & Security
Method	Endpoint	Purpose	Role
POST	/api/v1/auth/login	Login, issue JWT + refresh token	Public
POST	/api/v1/auth/refresh	Rotate refresh token	Public

Owned tables: users, refresh_tokens, audit_log

Team 2 — Hiring Intelligence
Method	Endpoint	Purpose	Role	Consumed by
POST	/api/v1/webhooks/n8n/signal-ingest	n8n pushes raw hiring signal	Service (API key)	n8n Workflow 1, 2
GET	/api/v1/hiring-signals	List signals, filter by hiring_type/status	MANAGER+	Team 4, Team 5
POST	/api/v1/leads/:id/research	Trigger Research Agent manually	SALES_REP+	Team 5
GET	/api/v1/leads	List/filter leads (hiring_type, stage, owner)	All (scoped)	Team 4, Team 5
PATCH	/api/v1/leads/:id	Update stage/owner/score	SALES_REP+ (own)	Team 4, Team 5

Owned tables: hiring_signals, companies, contacts, company_research, leads

⚠️ Breaking-change risk: leads schema changes affect Team 4's Communication Service (CRM timeline) and Team 5's Lead Management UI + Company Profile UI. Notify both team leads before merging any PR that changes this table.

leads table (current shape)
sql
leads (
  id UUID,
  hiring_signal_id UUID,
  company_id UUID,
  primary_contact_id UUID,
  hiring_type hiring_type,   -- INTERN | FULL_TIME | CONTRACT | BULK_HIRING | CAMPUS_DRIVE
  urgency VARCHAR(20),        -- LOW | MEDIUM | HIGH
  fit_score NUMERIC(5,2),
  stage lead_stage,           -- NEW -> RESEARCHED -> OUTREACH_DRAFTED -> APPROVED
                               -- -> SENT -> REPLIED -> MEETING_BOOKED -> WON/LOST
  owner_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
hiring_signals table (current shape)
sql
hiring_signals (
  id UUID,
  company_id UUID,
  source VARCHAR(100),        -- e.g. 'linkedin_jobs_api', 'career_page'
  source_url TEXT,
  role_title VARCHAR(255),
  hiring_type hiring_type,
  raw_payload JSONB,
  dedupe_key TEXT UNIQUE,      -- hash(domain + role_title + source_url)
  status signal_status,        -- NEW -> ENRICHING -> RESEARCHED -> QUALIFIED/REJECTED
  detected_at TIMESTAMPTZ
)
Team 3 — AI Platform
Method	Endpoint	Purpose	Role
GET	/api/v1/approval-queue	Pending drafts for review	SALES_REP+
POST	/api/v1/approval-queue/:id/approve	Approve/edit draft → triggers send	SALES_REP+
POST	/api/v1/approval-queue/:id/reject	Reject draft	SALES_REP+

Owned tables: approval_queue, company_memory (shared with Team 2 — see below)

⚠️ Cross-team schema: company_memory is written to by Team 2's Enrichment Agent and read by Team 3's Personalization/Follow-up Agents. Any change to this table needs sign-off from both Deepak (Team 2) and Ansh (Team 3).

Team 4 — Automation & Infrastructure
Method	Endpoint	Purpose	Role
POST	/api/v1/webhooks/n8n/step-complete	n8n reports follow-up step result	Service (API key)

Owned tables: workflow_runs, email_events, meetings

Team 5 — Product Experience
Method	Endpoint	Purpose	Role
POST	/api/v1/campaigns	Create campaign/template	MANAGER+
GET	/api/v1/analytics/daily	Dashboard metrics	All (scoped)

Owned tables: none (frontend only — consumes all other teams' APIs)

Cross-Team Dependency Map
If you change...	You must notify...
leads table/API	Team 4 (Communication Service), Team 5 (Lead UI)
companies / contacts table	Team 3 (AI Memory), Team 5 (Company Profile UI)
hiring_signals table	Team 4 (n8n workflows), Team 2 downstream modules
approval_queue table	Team 4 (n8n follow-up sequencer), Team 5 (Approval Queue UI)
company_memory table	Team 2 (writer), Team 3 (reader)
Change Log
Date	Change	Author
(add entries here as the schema evolves)
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
Team 3 — AI Platform & Universal Gateway
Method	Endpoint	Purpose	Role
GET	/api/v1/approval-queue	Pending drafts for review	SALES_REP+
POST	/api/v1/approval-queue/:id/approve	Approve/edit draft → triggers send	SALES_REP+
POST	/api/v1/approval-queue/:id/reject	Reject draft	SALES_REP+
GET	/api/v1/settings/ai	Fetch active AI model, temperature, keys	ADMIN+
PUT	/api/v1/settings/ai	Update dynamic AI provider/model settings	ADMIN+
POST	/api/v1/settings/ai/test	Verify AI provider connection live	ADMIN+

Owned tables: approval_queue, company_memory, system_settings

Team 6 — Talent Intelligence & Candidate Pool
Method	Endpoint	Purpose	Role
GET	/api/v1/candidates	List & multi-filter candidates (skills, ctc, location)	All (scoped)
POST	/api/v1/candidates	Create candidate profile manually	RECRUITER+
GET	/api/v1/candidates/stats	Get candidate pool KPIs and score aggregates	All (scoped)
POST	/api/v1/candidates/sync	Trigger live Indian developer talent sync	RECRUITER+
GET	/api/v1/candidates/export	Export candidates to CSV or styled Excel (.xlsx)	RECRUITER+
PUT	/api/v1/candidates/:id	Update candidate details, CTC, or status	RECRUITER+
DELETE	/api/v1/candidates/:id	Remove candidate profile	ADMIN, MANAGER

Owned tables: candidates

Team 7 — Scraper & Export Engine
Method	Endpoint	Purpose	Role
POST	/api/v1/scraper/trigger	Trigger multi-source live scraping radar	SALES_REP+
GET	/api/v1/scraper/auto-sync	Get background automated scraper status	All (scoped)
POST	/api/v1/scraper/auto-sync/toggle	Toggle background scraper interval/active	SALES_REP+
POST	/api/v1/scraper/auto-sync/run-now	Trigger immediate background scraper cycle	SALES_REP+
GET	/api/v1/export/leads	Stream leads export to CSV or styled Excel	All (scoped)

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
candidates table	Team 6 (Talent Intelligence), Team 5 (Candidate UI)
system_settings table	Team 3 (AI Gateway), Team 5 (Settings UI)

Change Log
Date	Change	Author
2026-09-17	Integrated Candidates Talent Radar, AI Gateway Multi-Provider Settings, Naukri & WorkIndia Radars, Noreply Filter, and Indian Geo-Purge	Lead Systems Architect
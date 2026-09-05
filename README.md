# HireGen AI — Platform Architecture & Engineering Guide

## 1. What is HireGen AI?

HireGen AI is an automated recruitment outreach platform designed for staffing firms, agencies, and internal talent acquisition teams. 

Instead of recruiters manually browsing LinkedIn or job portals all day, HireGen AI does the heavy lifting:
1. It constantly checks job boards and company career pages for new technical hiring signals.
2. It enriches the company details (size, domain, industry) and finds the right hiring manager contacts.
3. It uses AI to write tailored outreach emails referencing the specific job opening.
4. It places these drafts in an Approval Queue for team members to review.
5. Once approved, it handles automated email follow-up sequences and updates the pipeline when a meeting is booked.

---

## 2. End-to-End Workflow: From Job Post to Booked Meeting

Here is how data travels through the system from start to finish:

```text
[ Job Board / Career Page ]
            │
            ▼
    1. n8n Scheduled Poller
       (Finds open engineering role)
            │
            ▼
    2. Fastify Webhook Ingest (/api/v1/webhooks/n8n/signal-ingest)
       (Deduplicates by URL + role, creates Company record if new)
            │
            ▼
    3. Hiring Signal Created in PostgreSQL
       (Status: NEW)
            │
            ▼
    4. Lead Generation & Research Agent
       (Enriches company info, identifies decision-maker contact)
            │
            ▼
    5. AI Platform Service (Groq / Gemini)
       (Generates hyper-personalized cold email draft)
            │
            ▼
    6. Approval Queue (Frontend UI)
       (Sales Rep reviews, edits if needed, and clicks "Approve")
            │
            ▼
    7. Redis Queue (email-send)
       (Worker sends email via SMTP provider with rate-limiting)
            │
            ▼
    8. n8n Follow-Up Sequencer
       (Waits 3 days. If no reply, sends polite follow-up drip)
            │
            ▼
    9. Meeting Booked Webhook (/api/v1/webhooks/meeting-booked)
       (Calendly/Google Meet booked -> Lead stage moves to MEETING_BOOKED)
```

---

## 3. System Architecture & Tech Stack

The application is built with a decoupled, service-oriented structure:

### Frontend
- **Framework:** React 18, TypeScript, Vite.
- **Styling:** Tailwind CSS, Lucide Icons, ShadCN UI primitives.
- **State & Data:** Zustand for user session management, TanStack React Query for caching server state.
- **Features:** Unified Dashboard, Leads table with live Add/Edit/Delete modals, Approval Queue with diffing views, Campaigns list, Analytics charts, Role Administration panel, Live Notifications, and multi-tab Settings.

### Backend API
- **Framework:** Fastify on Node.js 20.
- **Security:** `@fastify/helmet` for HTTP security headers, `@fastify/cors` for origin controls, `@fastify/rate-limit` for DDoS prevention.
- **Authentication:** JWT access tokens (15-minute expiry) paired with database-backed refresh tokens that are revoked on logout.
- **Database Access:** Plain parameterized SQL queries through `pg` pool. Zero ORM bloat, zero SQL injection risk.

### Database
- **Engine:** PostgreSQL 15.
- **Migrations:** 6 clean, sequential SQL migration files (`migrations/001_...` through `006_...`) defining users, signals, companies, contacts, leads, approval drafts, campaigns, notifications, and profile fields.

---

## 4. How Docker, Redis, and n8n Work Together

### Docker & Docker Compose (`infra/docker-compose.yml`)
To avoid manual installations across different developer laptops, Docker Compose runs the whole application stack in isolated containers:
- `hiregen-postgres`: Database on internal port 5432.
- `hiregen-redis`: In-memory broker on port 6379.
- `hiregen-backend`: Fastify API server on port 3000.
- `hiregen-frontend`: Nginx serving the compiled React single-page app on port 8080.
- `hiregen-ai-platform`: LLM gateway service on port 3100.
- `hiregen-n8n`: Workflow automation interface on port 5678.
- `hiregen-prometheus` & `hiregen-grafana`: System telemetry on ports 9090 and 3001.

### Redis & BullMQ (`backend/src/queues/`)
Web scraping, LLM completions, and email deliveries are too slow to run inside normal API requests. If run synchronously, requests would time out and the UI would freeze.

Instead, the Fastify server pushes jobs to Redis queues, and background workers process them independently:
- **`audit-log`**: Writes security audit trails asynchronously.
- **`email-send`**: Sends outreach emails with rate-limiting and retry backoff.
- **`enrichment`**: Gathers company domains, headcount, and LinkedIn links.
- **`research`**: Scrapes and summarizes job post requirements.
- **`classification`**: Categorizes signals (Full-Time, Contract, Bulk Hiring).
- **`personalization`**: Calls AI models to draft outreach messages.
- **Dead Letter Queues (DLQ)**: Catches repeated job failures so engineers can inspect errors without losing jobs.

### n8n Workflows (`n8n-workflows/`)
n8n handles visual, scheduled automations through 10 version-controlled workflow files:
1. `01-signal-ingestion-poller.json`: Scrapes job boards on a timer and POSTs to `/api/v1/webhooks/n8n/signal-ingest`.
2. `02-career-page-watcher.json`: Watches career pages of target companies for new openings.
3. `03-enrichment-orchestrator.json`: Triggers contact discovery when a new signal is found.
4. `04-approval-reminder.json`: Sends alerts to sales reps if drafts stay in the queue too long.
5. `05-followup-sequencer.json`: Manages automated follow-up emails after 3 and 7 days.
6. `06-reply-sentiment-routing.json`: Categorizes prospect replies (Interested vs Not Interested).
7. `07-meeting-booking-sync.json`: Updates the lead stage to `MEETING_BOOKED` when a calendar invite is created.
8. `08-crm-hygiene-sync.json`: Cleans up stale records and maintains database consistency.
9. `09-daily-digest.json`: Generates daily activity summaries for managers.
10. `10-failure-watchdog.json`: Catches automation errors and logs them into PostgreSQL.

---

## 5. Role-Based Access Control (RBAC)

The system enforces 5 distinct roles:

1. **ADMIN**: Full access. Can create users, reassign roles, toggle active/inactive status, review audit logs, and configure system settings.
2. **MANAGER**: Can create and edit campaigns, re-assign leads to reps, and inspect department performance analytics.
3. **SALES_REP**: Can manage leads, trigger manual company research, create new leads, and approve or reject email drafts.
4. **RECRUITER**: Can search hiring signals, review candidate lists, and qualify talent sources.
5. **VIEWER**: Read-only access across all dashboards, reports, and activity logs.

> **Note on Account Credentials:**  
> For security reasons, live user credentials are not committed to version control. For evaluation and testing accounts, refer to the private project handover document or run the local database seed script.

---

## 6. How to Run the Project

### Option 1: Local Development (Node.js & PostgreSQL)

#### Step 1: Database Setup
Ensure PostgreSQL is running locally on port 5432, then create the database:
```sql
CREATE DATABASE hiregen;
```

#### Step 2: Backend
```bash
cd backend
npm install
node scripts/seed-mock-data.js
node src/server.js
```
*Note: The backend automatically checks and executes all sequential SQL migrations (`001` through `006`) on startup before listening on `http://127.0.0.1:3000`.*

#### Step 3: Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run at `http://127.0.0.1:5173`.*

---

### Option 2: 1-Command Docker Setup

Ensure Docker Desktop is running, then execute from the project root:
```bash
docker compose -f infra/docker-compose.yml up --build -d
```

All 8 interconnected services will build with isolated Linux dependencies and launch with automated health checks:
- **Frontend UI (Nginx SPA):** `http://localhost:8080` (or `http://localhost:5173` for Vite dev)
- **Fastify Core API:** `http://localhost:3000` *(Healthcheck: `http://localhost:3000/health`)*
- **AI Platform Service:** `http://localhost:3100` *(Healthcheck: `http://localhost:3100/health`)*
- **PostgreSQL 15:** Port `5433` (mapped to avoid conflicts with local Postgres on 5432)
- **Redis 7:** Port `6379`
- **n8n Workflow Automation:** `http://localhost:5678`
- **Grafana Monitoring:** `http://localhost:3001`
- **Prometheus Telemetry:** `http://localhost:9090`

To stop all running containers:
```bash
docker compose -f infra/docker-compose.yml down
```

---

## 7. Quality & Build Verification

The codebase has been verified against automated tests and production builds:
- **Frontend:** `npm run build` runs clean with 0 errors (Vite builds 3,049 modules in ~1 second).
- **Backend:** `npm test` passes all integration test suites.
- **SQL:** All migrations apply cleanly on a fresh database.

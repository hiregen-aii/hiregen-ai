# 🚀 HireGen AI — Complete Architecture & Setup Guide

HireGen AI is an autonomous, AI-powered hiring signal discovery and recruitment outreach platform. It aggregates live hiring signals across company career pages and job boards, enriches leads, crafts personalized AI outreach emails, runs automated follow-up sequences, and routes meetings.

---

## 🏗️ 1. Architecture: Docker, Redis, and n8n Roles

### 🐳 Docker & Docker Compose
- **Purpose:** Full-stack containerization and multi-service orchestration.
- **Why it's used:** Instead of forcing a user or evaluator to manually install and configure Node.js, PostgreSQL, Redis, n8n, Prometheus, and Grafana on their local system, Docker packages each service with its exact dependencies, network links, and health checks.
- **How it works:** Running `docker compose -f infra/docker-compose.yml up` spins up:
  1. `hiregen-postgres` (Port 5433/5432) — Main database
  2. `hiregen-redis` (Port 6379) — BullMQ job queue engine
  3. `hiregen-backend` (Port 3000) — Node.js Fastify API server
  4. `hiregen-frontend` (Port 8080) — Nginx serving Vite React SPA
  5. `hiregen-ai-platform` (Port 3100) — LLM Gateway (Groq / Gemini)
  6. `hiregen-n8n` (Port 5678) — Workflow automation engine
  7. `hiregen-prometheus` (Port 9090) & `hiregen-grafana` (Port 3001) — Telemetry & monitoring

---

### ⚡ Redis & BullMQ
- **Purpose:** Asynchronous, non-blocking background queue management.
- **Location in Code:** `backend/src/queues/`
- **Why it's used:** Scraping company websites, running AI LLM personalization, sending outreach emails, and recording audit logs take time. If done inside HTTP request handlers, API requests would freeze or time out.
- **How it works:**
  - Fastify produces a job (e.g. `auditLogQueue.add(...)`, `emailSendQueue.add(...)`).
  - Redis persists and coordinates the jobs across worker processes.
  - Dedicated workers process jobs in the background with automatic retries and Dead-Letter Queues (DLQ) for failed tasks.
  - **Active Queues:**
    - `audit-log`: Asynchronous audit trail recording.
    - `email-send`: Rate-limited email dispatch with retry logic.
    - `enrichment`: Company & contact data enrichment.
    - `research`: Automated company research scraping.
    - `classification`: Classifies job hiring signals.
    - `personalization`: Generates tailored outreach drafts using AI models.

---

### 🔄 n8n (Workflow Automation Engine)
- **Purpose:** Visual, trigger-based workflow orchestration and external service integrations.
- **Location in Code:** `n8n-workflows/` (10 version-controlled workflows) & `backend/src/webhooks/n8n.webhooks.js`
- **How it works:**
  - n8n runs scheduled pollers and webhook triggers, communicating with the backend via secure HMAC webhooks (`/api/v1/webhooks/...`):
  1. `01-signal-ingestion-poller.json`: Polls job boards / Adzuna and pushes new hiring signals to backend.
  2. `02-career-page-watcher.json`: Monitors company career pages for job openings.
  3. `03-enrichment-orchestrator.json`: Triggers domain and contact discovery.
  4. `04-approval-reminder.json`: Sends reminders when drafts in the Approval Queue are pending.
  5. `05-followup-sequencer.json`: Executes automated multi-step drip email sequences (Day 3, Day 7 follow-ups).
  6. `06-reply-sentiment-routing.json`: Analyzes prospect email replies (Positive/Interested vs Unsubscribe) and updates lead stages.
  7. `07-meeting-booking-sync.json`: Detects booked Calendly / Google Meet appointments and moves leads to `MEETING_BOOKED`.
  8. `08-crm-hygiene-sync.json`: Archival and stage consistency management.
  9. `09-daily-digest.json`: Compiles and delivers daily activity reports to team managers.
  10. `10-failure-watchdog.json`: Traps execution failures and logs them to `workflow_runs` table in PostgreSQL.

---

## 💻 2. How to Run the Project (For New Users)

You have two simple ways to run HireGen AI:

### Method A: Local Development Mode (Fastest & Lightest on Laptop)

#### Step 1: PostgreSQL Setup
Ensure PostgreSQL is running locally on port `5432`. Create the database:
```sql
CREATE DATABASE hiregen;
```

#### Step 2: Backend Setup
```bash
cd backend
npm install
npm run migrate
node scripts/seed-mock-data.js
node src/server.js
```
*Backend will start on `http://127.0.0.1:3000`.*

#### Step 3: Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend will start on `http://127.0.0.1:5173`.*

---

### Method B: Docker Compose Mode (1-Command Full Stack)

To run the entire system including PostgreSQL, Redis, Fastify Backend, React Frontend, AI Gateway, n8n, and Monitoring:

#### Step 1: Clone & Configure
```bash
cp backend/.env.example backend/.env
```

#### Step 2: Launch Containers
```bash
docker compose -f infra/docker-compose.yml up --build -d
```

#### Step 3: Access All Services
| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | `http://localhost:8080` (or `5173` in dev) | React 18 UI Dashboard |
| **Fastify API Server** | `http://localhost:3000` | REST API & Webhooks |
| **API Health Check** | `http://localhost:3000/health` | Service Health Status |
| **n8n Automation** | `http://localhost:5678` | Visual Workflow Editor |
| **AI Platform Service** | `http://localhost:3100` | LLM Gateway Service |
| **Grafana Dashboards** | `http://localhost:3001` | System & Queue Monitoring |
| **Prometheus Metrics** | `http://localhost:9090` | Time-series Metrics Engine |

---

## 👥 3. Default Login Credentials (RBAC Roles)

All accounts are pre-seeded in the database:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@hiregen.ai` | `Admin@123` | Full system access, user management, audit logs, system settings |
| **Manager** | `priya.sharma@hiregen.ai` | `Admin@123` | Campaign creation, lead re-assignment, analytics, team oversight |
| **Sales Rep** | `rahul.verma@hiregen.ai` | `Admin@123` | Lead actions, trigger research, approval queue review |
| **Recruiter** | `sneha.kapoor@hiregen.ai` | `Admin@123` | Candidate evaluation, hiring signal discovery |
| **Viewer** | `vikram.singh@hiregen.ai` | `Admin@123` | Read-only access across dashboards and reports |

---

## 📁 4. Project Directory Structure

```text
hiregen-ai/
├── backend/               # Node.js Fastify API, JWT Auth, RBAC, Migrations, Repositories
│   ├── migrations/        # Versioned SQL migrations (001 to 006)
│   ├── scripts/           # Seed scripts & mock data generators
│   ├── src/               # Controllers, repositories, routes, queues, webhooks
│   └── tests/             # Migration & integration test suites
├── frontend/              # React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
│   ├── src/components/    # Reusable UI components & settings panels
│   ├── src/features/      # Domain modules (Leads, Approval, Campaigns, Admin, Settings)
│   └── src/context/       # Global contexts (Auth, Profile, Settings, Notifications)
├── ai-platform-service/   # Standalone AI LLM gateway (Groq, Gemini)
├── docker/                # Multi-stage Dockerfiles & Nginx configs
├── docs/                  # SRS and API Contract specifications
├── infra/                 # Docker Compose, Prometheus rules, Grafana configs
└── n8n-workflows/         # 10 production-ready exported n8n workflow JSONs
```

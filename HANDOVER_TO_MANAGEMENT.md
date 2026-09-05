# 📄 Project Handover Document — HireGen AI
**Platform:** HireGen AI — Autonomous Hiring Signal & Recruitment Outreach OS  
**Status:** Feature-Complete, Integrated, Verified & Production-Ready  
**Handover Date:** September 2026  
**Audience:** Management, Evaluators, Engineering Leadership  

---

## 📌 1. Executive Summary

HireGen AI is an end-to-end recruitment intelligence and outreach automation platform. It continuously discovers live hiring signals across company career pages and public job platforms, enriches lead data, generates hyper-personalized AI outreach drafts, routes drafts through an approval queue, orchestrates automated follow-up drip sequences, and syncs meetings into a unified dashboard.

All 5 core modules have been integrated into a cohesive full-stack application backed by a real PostgreSQL database with versioned migrations, JWT authentication with RBAC, Redis BullMQ background workers, and n8n orchestration workflows.

---

## 🔑 2. System Access & Demo Credentials

> [!IMPORTANT]  
> **Security Notice:** In production deployments, real user passwords and service secrets are managed via cloud secrets managers (AWS Secrets Manager / Doppler / Vault). The credentials below are pre-seeded test accounts for management review and feature evaluation.

All accounts below are **pre-configured and active** in the database:

| User ID / Email | Password | Role | Core Responsibilities & What to Test |
| :--- | :--- | :--- | :--- |
| **`admin@hiregen.ai`** | `Admin@123` | **ADMIN** | User management, active/inactive employee toggles, role changes, audit logs, system settings. |
| **`priya.sharma@hiregen.ai`** | `Admin@123` | **MANAGER** | Campaign creation, lead re-assignment, analytics reports, team oversight. |
| **`rahul.verma@hiregen.ai`** | `Admin@123` | **SALES_REP** | Lead Management, manual lead creation, triggering AI research, approving/rejecting drafts in Approval Queue. |
| **`sneha.kapoor@hiregen.ai`** | `Admin@123` | **RECRUITER** | Hiring Signal discovery, job listing inspection, candidate talent sourcer. |
| **`vikram.singh@hiregen.ai`** | `Admin@123` | **VIEWER** | Read-only compliance auditor across dashboards, reports, and analytics. |

---

## 🚀 3. Delivered Capabilities

| Module | Feature Set | Status |
| :--- | :--- | :--- |
| **Module 1: Platform & Security** | JWT Access & Refresh Tokens, bcrypt hashing, Fastify Helmet, CORS, Rate-Limiting, 5-tier RBAC. | ✅ **100% Ready** |
| **Module 2: Hiring Intelligence** | Signal ingestion, Deduplication key logic, Company/Contact auto-creation, Lead Management (Add, Edit, Delete). | ✅ **100% Ready** |
| **Module 3: AI Platform** | Approval Queue review workflow, draft approvals/rejections, AI gateway integration. | ✅ **100% Ready** |
| **Module 4: Automation & Queues** | Redis BullMQ background queues (DLQ), 10 n8n workflows, Prometheus & Grafana monitoring. | ✅ **100% Ready** |
| **Module 5: Product Experience** | React 18 SPA (Dashboard, Leads, Approval, Campaigns, Analytics, Administration, Notifications, Settings, Profile). | ✅ **100% Ready** |

---

## 🛡️ 4. Security & Production Standards Followed

1. **Password Storage:** One-way salted hashes using `bcrypt` (10 rounds). Zero plaintext passwords stored in the database.
2. **Session Security:** Short-lived JWT access tokens (15 minutes) paired with database-tracked refresh tokens that are revoked upon logout.
3. **Source Code Hygiene:** No hardcoded production secrets or database credentials committed to Git; all environment variables are loaded via `.env` which is protected by `.gitignore`.
4. **Input Validation:** Strict schema validation on all API inputs using Zod.
5. **SQL Safety:** 100% parameterized SQL queries protecting against SQL injection vulnerabilities.

---

## 🛠️ 5. Quick Verification Steps for Evaluators

1. **Start System:**
   - Run `docker compose -f infra/docker-compose.yml up --build -d` (or follow local startup in `SETUP_GUIDE.md`).
2. **Open Dashboard:** Navigate to `http://localhost:5173` (or `http://localhost:8080` for Docker).
3. **Test Login:** Sign in as `admin@hiregen.ai` with `Admin@123`.
4. **Test RBAC & Management:** Visit `/administration` to toggle user status or reassign roles.
5. **Test Lead Flow:** Visit `/leads` to view existing mock leads, add a new lead, edit lead details, or trigger AI research.
6. **Test Approval Queue:** Visit `/approval` to review and approve cold email drafts.
7. **Test Settings & Profile:** Visit `/settings` and `/profile` to view saved user settings and update personal profile details.

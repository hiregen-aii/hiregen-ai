# Platform Security Backend

This service is the authentication, authorization, and hiring signal ingestion backend for HireGen AI.

## What is included

- Fastify server with production-style response contract
- PostgreSQL connection using plain parameterized SQL
- Zod-based startup environment validation
- JWT authentication
- Refresh token support
- Logout support
- Role-Based Access Control (RBAC)
- Versioned SQL migrations
- Repository structure aligned to the shared domain model
- Hiring Signal Discovery Webhook
- Adzuna Job API Integration
- Job Signal Normalization
- Duplicate Hiring Signal Detection
- Automatic Company Creation
- Hiring Signal Storage with PostgreSQL

---

# Signal Discovery Module (Module 2.1)

This module is responsible for discovering real-time hiring opportunities from public job APIs and storing normalized hiring signals in PostgreSQL.

### Features

- Fetches real-time job postings from the Adzuna Jobs API.
- Automates job collection using n8n workflows.
- Normalizes different job data formats into a common schema.
- Prevents duplicate hiring signals using a generated dedupe key.
- Automatically creates companies if they do not already exist.
- Stores hiring signals with an initial status of `NEW`.
- Exposes REST APIs for retrieving hiring signals.

---

## Signal Discovery Workflow

```text
Adzuna Jobs API
        │
        ▼
n8n Signal Ingestion Poller
        │
        ▼
Normalize Job Listings
        │
        ▼
POST /api/webhooks/signal-ingest
        │
        ▼
Discovery Agent
        │
        ▼
Hiring Signal Service
        │
        ▼
PostgreSQL (hiring_signals)
```

---

## Hiring Signal API

### Store Hiring Signal

```
POST /api/webhooks/signal-ingest
```

Receives normalized hiring signals from the n8n workflow and stores them in PostgreSQL.

---

### Retrieve Hiring Signals

```
GET /api/hiring-signals
```

Returns all stored hiring signals.

---

## Main response contract

All API handlers follow this shape:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "requestId": "..."
  }
}
```

---

## Default admin credentials

- Email: admin@hiregen.ai
- Password: Admin@123

---

## Required environment variables

Set these in a local `.env` file before starting the service:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password

JWT_SECRET=your-32-character-secret
REFRESH_SECRET=your-32-character-secret

ADMIN_EMAIL=admin@hiregen.ai
ADMIN_PASSWORD=Admin@123

DATABASE_URL=postgresql://postgres:your-password@localhost:5432/postgres
```

---

# n8n Workflow

The project uses an n8n workflow to automate hiring signal discovery.

### Current Job Source

- Adzuna Jobs API

### Workflow Steps

1. Schedule Trigger (Every 15 Minutes)
2. Fetch Real-Time Jobs from Adzuna
3. Normalize Job Listings
4. Send Hiring Signals to Fastify Webhook
5. Store Hiring Signals in PostgreSQL

---

## Procedure for a Fresh Clone

### 1. Install prerequisites

- Node.js
- npm
- PostgreSQL
- n8n

### 2. Clone the repository

```bash
git clone <repository-url>
cd hiregen-ai/backend
```

### 3. Configure environment variables

Create a `.env` file using the values shown above.

### 4. Install dependencies

```bash
npm install
```

### 5. Run database migrations

```bash
npm run migrate
```

### 6. Start the backend

```bash
npm run start
```

### 7. Start n8n

```bash
n8n start
```

### 8. Import the workflow

Import the workflow located in:

```
n8nworkflows/01.signal-ingestion-poller.json
```

### 9. Execute the workflow

The workflow will periodically fetch jobs from Adzuna and send normalized hiring signals to:

```
POST http://localhost:3000/api/webhooks/signal-ingest
```

---

## Commands

```bash
npm install
npm run migrate
npm run start
npm run test
```

---

## Technologies Used

- Node.js
- Fastify
- PostgreSQL
- Zod
- JWT
- n8n
- Adzuna Jobs API
- JavaScript
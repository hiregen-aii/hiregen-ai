# HireGen AI — Team 3 Integrated Backend

This package contains **Team 3 only**: Modules 3.1 through 3.6 merged into one backend repository.

## Included modules

- 3.1 — AI Gateway
- 3.2 — Prompt Engine
- 3.3 — AI Memory
- 3.4 — Personalization
- 3.5 — Follow-up Intelligence
- 3.6 — AI Analytics

## Merge strategy

The modules are kept under `backend/src/modules/3.x-*` to eliminate same-path collisions between independently developed module ZIPs. Cross-module test adapters live under `backend/src/integration/adapters`.

The merge does **not** include Team 2 code.

## Important integration decisions

1. 3.1 is the single AI execution boundary. Provider calls are not duplicated in 3.2–3.6.
2. 3.1 accepts optional prompt metadata (`templateId`, `promptVersion`, `leadId`, `inputHash`) so execution context can reach the analytics logging hook.
3. 3.2 validates request bodies through Zod in the service rather than passing a Zod schema directly to Fastify's JSON-schema validator.
4. 3.3 retains its PostgreSQL repository for production integration; the smoke test uses an in-memory repository adapter.
5. 3.4 retains its PostgreSQL template repository contract; the smoke test uses an in-memory template repository adapter.
6. 3.5 retains its queue/repository integration contracts; the smoke test uses an in-memory read repository.
7. 3.6 retains its database repository contract; the smoke test uses an in-memory analytics repository.
8. No API keys, `.env` files, `node_modules`, or generated `dist` files are included.

## Run locally

```bash
cd backend
npm install
npm test
npm run build
npm start
```

The smoke test is intentionally provider-key free. It injects mock providers into the 3.1 Gateway and verifies the cross-module execution path.

## HTTP smoke endpoint

After `npm start`:

```text
GET  /health
POST /api/v1/prompt-engine/render
GET  /api/v1/analytics/daily
```

The production PostgreSQL-backed 3.3 and 3.6 routes remain available in their module source, but their database credentials/schema are intentionally not invented in this merge package.

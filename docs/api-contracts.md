# API Contracts — Source of Truth

Any team changing a shared endpoint/schema MUST update this file
and notify the consuming teams BEFORE merging.

## Team 2 owned endpoints (consumed by Team 4 & Team 5)
- GET  /api/v1/hiring-signals
- GET  /api/v1/leads
- PATCH /api/v1/leads/:id
- POST /api/v1/leads/:id/research

# Platform Security Backend

This service is the authentication and authorization backend for HireGen AI.

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

## Default admin credentials

- Email: admin@hiregen.ai
- Password: Admin@123

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
## procedure for the fresh clone 
Install Node.js, npm, and PostgreSQL
Clone the repo and go to the backend folder:
cd hiregen-ai/backend
Create your environment file:
use backend/.env or copy from backend/.env.example
Make sure PostgreSQL is running and the database exists
Install dependencies:

## Commands

```bash
cd platform-security
npm install
npm run migrate
npm run start
npm run test
```
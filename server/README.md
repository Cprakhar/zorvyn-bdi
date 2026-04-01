# Finance Dashboard Backend

A TypeScript backend for managing users, role-based access control, financial transactions, and dashboard summaries.

## Tech Stack

- Express 5
- TypeORM
- SQL.js persistence (file-backed)
- Vitest + Supertest integration tests

## Run Locally

1. Install dependencies:

   pnpm install

2. Start in watch mode:

   pnpm dev

3. Build and run:

   pnpm build
   pnpm start

Server defaults:

- Port: 3000
- Database file location: finance.sqlite

You can override with environment variables:

- PORT
- DB_PATH

## Authentication Model

This project supports both token-based auth and mock header auth for local development.

Token flow:

- POST /auth/token with `{ "email": "user@example.com" }`
- Use `Authorization: Bearer <accessToken>` on protected endpoints

Header fallback (for quick local testing):

- x-user-id: <user-id>
- or x-user-email: <email>

Requests without one of these headers are rejected.

On first boot, if no users exist, a default admin is seeded:

- email: admin@finance.local

## Roles and Access Control

- viewer:
  - Can access dashboard summary only
- analyst:
  - Can read transactions and dashboard summary
- admin:
  - Full user management and transaction CRUD

## API Endpoints

### Health

- GET /health

### Users (admin only)

- GET /users
- POST /users
- PATCH /users/:id

User fields:

- name
- email
- role: viewer | analyst | admin
- isActive

### Transactions

- GET /transactions (analyst, admin)
  - Filters (optional query params):
    - type: income | expense
    - category
    - startDate (ISO string)
    - endDate (ISO string)
    - page (default: 1)
    - pageSize (default: 20, max: 100)
- POST /transactions (admin)
- PATCH /transactions/:id (admin)
- DELETE /transactions/:id (admin)

Transaction fields:

- amount (positive integer)
- type: income | expense
- category
- transactionDate (ISO string)
- description (optional, nullable)

### Dashboard Summary

- GET /dashboard/summary (viewer, analyst, admin)

Response includes:

- totalIncome
- totalExpense
- netBalance
- categoryTotals
- recentActivity
- monthlyTrends

### API Documentation

- GET /docs-json (OpenAPI document)
- GET /docs (Swagger UI)

### Rate Limiting

- Global rate limit on all endpoints
- Stricter limit on /auth/token
- Write-operation limit on POST/PATCH/DELETE user and transaction routes

## Validation and Error Handling

The API returns structured errors with suitable HTTP status codes:

- 400 for validation errors
- 401 for missing/invalid auth headers
- 403 for forbidden actions or inactive users
- 404 for missing resources
- 409 for conflicts (e.g., duplicate email)
- 500 for unexpected errors

## Tests

Run tests:

pnpm test

Current integration coverage includes:

- Token issuance and bearer-authenticated access
- Role-based restrictions
- Transaction creation/read constraints per role
- Dashboard summary aggregation
- Transaction filtering and pagination
- API docs endpoint availability

## Notes and Assumptions

- Authentication is simplified and email-based for token issuance (no password flow).
- Persistence uses SQL.js for easier local setup and test portability.

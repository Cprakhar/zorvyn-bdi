# Zorvyn BDI - Finance Dashboard System

Full-stack assessment project for finance data processing and access control.

Live deployments:

- Web (Vercel): https://zorvyn-bdi.vercel.app/
- Server (Render): https://zorvyn-bdi.onrender.com
  - Note: backend instance may be asleep; trigger it manually first by opening the URL.

This repository includes:

- Backend API with role-based access control, transaction management, dashboard summaries, token auth, pagination, search, rate limiting, and API docs.
- Frontend dashboard built with Next.js, split into reusable components, connected to the backend API.

## Repository Structure

- server: Express + TypeORM backend
- web: Next.js frontend dashboard
- TASK.md: Original assignment prompt

## Core Features

### Backend

- User and role management (viewer, analyst, admin)
- Financial record CRUD and filtering
- Dashboard summary API (income, expense, net, category totals, trends)
- Access control enforcement by role
- Validation and structured error handling
- Token authentication (JWT)
- Pagination and search support
- Rate limiting
- OpenAPI docs + Swagger UI
- Integration tests

### Frontend

- Token-based sign-in by email
- Dashboard summary cards
- Transaction table with filtering, pagination, and search
- Admin-only transaction creation form
- Reusable dashboard component architecture
- API docs quick link

## Quick Start

### 1) Backend

From the server directory:

```bash
pnpm install
pnpm dev
```

Backend runs on port 3000 by default.

Useful endpoints:

- GET /health
- POST /auth/token
- GET /transactions
- GET /dashboard/summary
- GET /docs
- GET /docs-json

Production base URL:

- https://zorvyn-bdi.onrender.com

### 2) Frontend

From the web directory:

```bash
pnpm install
pnpm dev
```

Create env file at web/.env.local:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

Open the frontend URL printed by Next.js (usually http://localhost:3001).

Production URL:

- https://zorvyn-bdi.vercel.app/

## Scripts

### Backend (server)

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
```

### Frontend (web)

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Containerized Local Setup

Use Docker Compose to run backend and frontend together:

```bash
docker compose up --build
```

Services:

- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

Stop services:

```bash
docker compose down
```

Persisted backend data is stored in the Docker volume `server_data`.

## Test Status

Backend integration tests cover RBAC, token auth, filtering, pagination, search, summary, and docs route behavior.

## Notes

- The backend seeds a default admin user when no users exist:
  - admin@finance.local
- Header-based auth is also supported for local testing in addition to bearer tokens.

## License

This repository is for assessment/demo purposes.

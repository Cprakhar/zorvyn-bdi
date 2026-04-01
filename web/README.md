# Fluxboard Finance Frontend

Next.js dashboard UI for the finance backend.

## Features

- JWT token login using email via `/auth/token`
- Live dashboard summary cards (income, expense, net balance)
- Transaction table with filter + pagination controls
- Admin-only transaction creation form
- Quick link to backend API docs (`/docs`)
- Session persistence in browser local storage

## Environment

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3001` or the port shown by Next.js.

## Build

```bash
pnpm build
pnpm start
```

## Notes

- Default seeded backend admin email is `admin@finance.local`.
- Viewer and analyst roles can sign in and access read-only views according to backend RBAC.

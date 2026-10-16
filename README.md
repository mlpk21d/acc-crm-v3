# ACC CRM V3

Next.js/PostgreSQL rebuild of ACC CRM.

## Direction

- Next.js App Router
- TypeScript
- PostgreSQL backend
- Preserve the existing ACC CRM UI layout as closely as practical
- Build domain modules for dashboard, invoices, contacts, projects, settings, and users
- Keep repository indexing current as the application evolves

## Requirements

- Node.js 24+
- PostgreSQL
- npm

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Before running the database health route, update `DATABASE_URL` in `.env.local`.

## Validation

```bash
npm run check
npm run build
```

## Current routes

- `/` — Dashboard
- `/invoices`
- `/contacts`
- `/projects`
- `/settings`
- `/users`
- `/api/health/database`

See `PROJECT_INDEX.md` for the maintained repository index.

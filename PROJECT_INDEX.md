# ACC CRM V3 Project Index

Last updated: 2026-10-16

This file is the fast-entry index for the repository. Update it whenever routes,
domain boundaries, database modules, or major shared components change.

## Project direction

Primary implementation direction is defined by `acc-crm-v3-specification.md`
from the ACC CRM V3 project context.

Hard UI constraint: preserve the existing ACC CRM layout and interaction model as
closely as practical. V3 is a platform/backend modernization, not a visual redesign.

## Runtime and configuration

| Path | Purpose |
| --- | --- |
| `package.json` | Next.js/React/PostgreSQL dependencies and core scripts |
| `tsconfig.json` | Strict TypeScript and `@/*` source alias |
| `next.config.ts` | Next.js application configuration |
| `eslint.config.mjs` | Next.js + TypeScript linting |
| `.env.example` | Required local environment variables |
| `scripts/db/migrate.mjs` | Versioned, checksummed, locked PostgreSQL migration runner |
| `src/db/README.md` | Database setup, migration policy, safety notes |
| `src/db/migrations/0001_crm_foundation.sql` | CRM users and contacts base tables + partial indexes |

## Application shell

| Path | Purpose |
| --- | --- |
| `src/app/layout.tsx` | Root application layout |
| `src/app/globals.css` | Initial CRM layout tokens/styles; avoid redesign drift |
| `src/components/app-shell.tsx` | Persistent sidebar/header navigation |
| `src/components/page-placeholder.tsx` | Temporary domain route scaffold |

## Page routes

| Route | File | Status |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Scaffolded dashboard |
| `/invoices` | `src/app/invoices/page.tsx` | Scaffolded |
| `/contacts` | `src/app/contacts/page.tsx` | Scaffolded |
| `/projects` | `src/app/projects/page.tsx` | Scaffolded |
| `/settings` | `src/app/settings/page.tsx` | Scaffolded |
| `/users` | `src/app/users/page.tsx` | Scaffolded |

## Server/database

| Path | Purpose |
| --- | --- |
| `src/lib/env.ts` | Validated server environment access |
| `src/lib/db.ts` | Shared PostgreSQL connection pool |
| `src/app/api/health/database/route.ts` | Database connectivity health check |

## Current database schema

| Table | Role |
| --- | --- |
| `public.schema_migrations` | Tracks applied SQL migration versions and checksums |
| `public.crm_users` | CRM profiles and roles, distinct from authentication accounts |
| `public.contacts` | Initial contact details, audit references, and soft deletion |

**Run:** `npm run db:migrate` after copying `.env.example` to `.env.local` and configuring PostgreSQL. Migration has been authored but NOT executed against a database in this session.

**Specification gap:** `acc-crm-v3-specification.md` is not present in the accessible repository. Treat contact fields and roles as preliminary until reconciled; do not infer legacy functionality.

## Planned domain boundaries

Introduce these folders as each feature is implemented instead of putting business
logic directly in route files:

- `src/features/dashboard/`
- `src/features/invoices/`
- `src/features/contacts/`
- `src/features/projects/`
- `src/features/settings/`
- `src/features/users/`
- `src/features/auth/`
- `src/db/migrations/`
- `src/db/queries/`

## Bootstrap status

Completed:

- Next.js 16 App Router foundation
- React 19 + strict TypeScript
- PostgreSQL pool boundary
- Environment validation
- Existing-layout-oriented sidebar/header shell
- Primary CRM route placeholders
- Database health endpoint
- Repository index
- SQL migration runner and first PostgreSQL CRM migration (not yet executed)

Next:

1. Add the full `acc-crm-v3-specification.md` to this repository as the canonical implementation reference.
2. Run migrations on an isolated development PostgreSQL database; review SQL and inspect the created indexes.
3. Select and integrate authentication sessions/permissions; preserve the existing CRM role semantics.
4. Build shared form/table/modal primitives based on the existing CRM screenshots.
5. Reconcile Contacts field definitions with the specification, then implement end-to-end.
6. Implement Projects and room/J&K workflows.
7. Implement Invoices and invoice calculations/status behavior.
8. Implement Settings, Users, and Dashboard widgets.
9. Add unit, integration, and end-to-end coverage as each domain becomes functional.

## Index maintenance rule

Every structural change must be reflected here in the same change set. New routes,
API endpoints, migrations, shared modules, and major feature files must be indexed.

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
| `.env.example` | Required local environment variables, including INITIAL_ADMIN_* bootstrap configuration |
| `scripts/db/migrate.mjs` | Versioned, checksummed, locked PostgreSQL migration runner |
| `src/db/README.md` | Database setup, migration policy, safety notes |
| `src/db/migrations/0001_crm_foundation.sql` | CRM users and contacts base tables + partial indexes |
| `src/lib/auth.ts` | Server-only runtime Better Auth instance |
| `src/lib/auth-options.ts` | Shared, CLI-safe Better Auth options and plugins |
| `scripts/auth/cli-config.ts` | CLI-only Better Auth instance without `server-only` imports |
| `auth` devDependency | Current supported Better Auth CLI, aligned with runtime version |
| `src/db/migrations/0002_better_auth.sql` | Committed Better Auth tables and indexes; user reports local migration applied |
| `src/db/migrations/0003_projects_foundation.sql` | Provisional projects table, optional contact FK, statuses, audit fields and indexes (NOT applied) |
| `scripts/auth/link-admin.mjs` | Transactional Better Auth-to-CRM administrator linkage |
| `scripts/auth/bootstrap-admin.mjs` | One-time initial administrator from `.env.local`, refuses existing user stores |
| `docs/authentication.md` | Setup sequence, security constraints, and verification checklist |
| `src/features/auth/session.ts` | Session-to-CRM-user authorization lookup |
| `src/features/auth/permissions.ts` | Explicit role/permission matrix |
| `src/features/auth/login-form.tsx` | Email/password sign-in form |
| `src/features/auth/sign-out-button.tsx` | Session sign-out in CRM header |
| `src/app/api/auth/access/route.ts` | No-store check of active CRM session authorization |
| `tests/auth-permissions.test.mjs` | Node test of role permission matrix |
| `src/app/api/auth/[...all]/route.ts` | Better Auth HTTP endpoints |

## Application shell

| Path | Purpose |
| --- | --- |
| `src/app/layout.tsx` | Public root HTML layout |
| `src/app/(crm)/layout.tsx` | Protected CRM shell and authorization boundary |
| `src/app/globals.css` | Legacy-derived white sidebar, gray workspace, rounded panels, responsive tables and three-column form CSS |
| `src/components/app-shell.tsx` | Legacy-derived 256px white sidebar, profile/footer and role-filtered navigation; brand logo and active-route state still pending |
| `src/components/page-placeholder.tsx` | Temporary domain route scaffold |

## Page routes

| Route | File | Status |
| --- | --- | --- |
| `/` | `src/app/(crm)/page.tsx` | Scaffolded dashboard |
| `/invoices` | `src/app/(crm)/invoices/page.tsx` | Scaffolded |
| `/contacts` | `src/app/(crm)/contacts/page.tsx` | Searchable, paginated list |
| `/contacts/new` | `src/app/(crm)/contacts/new/page.tsx` | Create contact (write permission) |
| `/contacts/[id]` | `src/app/(crm)/contacts/[id]/page.tsx` | Contact detail + soft-delete |
| `/contacts/[id]/edit` | `src/app/(crm)/contacts/[id]/edit/page.tsx` | Update contact |
| `/projects` | `src/app/(crm)/projects/page.tsx` | Searchable paginated list |
| `/projects/new` | `src/app/(crm)/projects/new/page.tsx` | Create project |
| `/projects/[id]` | `src/app/(crm)/projects/[id]/page.tsx` | Project detail |
| `/projects/[id]/edit` | `src/app/(crm)/projects/[id]/edit/page.tsx` | Edit project |
| `/settings` | `src/app/(crm)/settings/page.tsx` | Scaffolded |
| `/users` | `src/app/(crm)/users/page.tsx` | Scaffolded |

Additional public pages: `src/app/login/page.tsx` (login) and `src/app/forbidden/page.tsx` (access denied). Route groups do not change public URLs.

## Contacts feature index

| Path | Purpose |
| --- | --- |
| `src/features/contacts/data.ts` | Parameterized PostgreSQL contact queries and pagination |
| `src/features/contacts/actions.ts` | Permission-checked create/update/soft-delete server actions |
| `src/features/contacts/validation.ts` | Shared strict Zod contact parsing and UUID checks |
| `tests/contact-validation.test.mjs` | Unit coverage for contact validation and normalization |
| `src/features/contacts/contact-form.tsx` | Three-section legacy-style Company / Person & Contact / Sales Notes form with `useActionState`; only currently persisted V3 fields exposed |
| `src/features/contacts/delete-contact-form.tsx` | Confirmation before soft-delete submission |
| `tests/integration/contact-db.test.mjs` | Transactional PostgreSQL insert/update/delete and constraint tests (rolled back) |

Contacts validation now rejects missing submitted fields and normalizes country code. Form errors are rendered inline and deletion requires confirmation. Unit and database integration tests added (`npm run test:integration`; local DB required). Contacts has not been build-tested or browser-tested against the local PostgreSQL instance. The form now follows the original repository's three-column grouping, but legacy Region, Type, Status, Contacted, Comments rich text, Website and associated field semantics are not yet migrated to V3. Form fidelity is incomplete; screenshot-by-screenshot browser validation remains outstanding. List search uses case-insensitive partial matches; pagination is 25 rows per page. No database schema migration was required.

## UI preservation audit (2026-10-16)

Reference reviewed: original `mlpk21d/acc-crm` main branch, including `src/components/Layout.tsx`, `src/index.css`, `src/pages/contacts/ContactList.tsx`, `src/pages/contacts/ContactForm.tsx`, and `src/pages/projects/ProjectForm.tsx`. The screenshot archive and full specification are not accessible as files in this repository; visual acceptance is therefore **not yet confirmed**.

Completed in V3 main:
- Sidebar changed from dark 220px generic navigation to legacy-style white 256px navigation with footer identity and sign-out.
- Shared page canvas, panel radii, table headers, buttons and typography moved toward source application styles.
- Contacts create/edit form grouped into Company, Person & Contact and Sales Notes columns without changing supported action/DB field names.

Outstanding fidelity and functional work (do not mark complete):
- Original logo asset, icon-based navigation, active-route indicator and mobile drawer implementation.
- Contacts list legacy ten-column structure, advanced filter modal, badges/status row colors, comment modal, contacted toggle and pagination.
- Contact fields/status option sources and rich text from original schema; preserve semantics rather than invent mapping.
- Projects list/form: original project fields, contact lookup, room cards/table, room editing modal, J&K cabinet configuration, checklist, pricing and role-limited financial display.
- Screenshot-based comparison at desktop/mobile widths, build/lint/typecheck/runtime validation.
- Follow the screenshot ZIP and canonical specification when available. Do not treat source-repository CSS as proof of pixel-perfect screenshot equivalence.

## Projects feature index

| Path | Purpose |
| --- | --- |
| `src/features/projects/data.ts` | Parameterized project listing/detail and active contact choices |
| `src/features/projects/actions.ts` | Server-side permission checked create/update actions |
| `src/features/projects/validation.ts` | Project input validation |
| `src/features/projects/project-form.tsx` | Shared provisional create/edit project form |

**Important:** Migration 0003 is authored but has not been executed or build-tested here. Review it before `npm run db:migrate`. Room records, J&K workflow, final statuses and legacy field mapping require the canonical specification; do not assume that this is the final project schema.

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

## Authentication implementation status

Minimum password length is 8 characters in shared Better Auth configuration and initial administrator bootstrap validation. Longer unique passwords are recommended.


Authentication handlers, login form, gated CRM layout, and role checks are scaffolded. CLI corrected to installed `auth` executable, with runtime and CLI versions aligned. CLI reads separate config to avoid the Next.js `server-only` resolution error. **Not yet operational:** Better Auth schema has been committed and user reports its local migration applied; administrator provisioning and CRM linkage have not been executed (environment-driven bootstrap command implemented), and no build or integration tests have been run. Never grant access by email match alone; active `crm_users.auth_user_id` linkage is required. The authorization check in the CRM route-group layout does not replace per-handler authorization for future API endpoints/server actions.

Navigation now filters role-specific links and logout is available. Login and logout use Next.js client router navigation (`replace` and `refresh`) rather than `window.location.assign`, addressing Next.js lint warnings. A lightweight `npm run test:unit` checks permission definitions. **Runtime login/logout and the tests have not yet been executed in this session.**

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
2. Initial development PostgreSQL migrations reported verified by user; verify Better Auth table presence during bootstrap.
3. Run `npm run auth:bootstrap-admin` once on the local database, validate login and permissions, and add session tests. Keep public registration disabled.
4. Build shared form/table/modal primitives based on the existing CRM screenshots.
5. Run local build and `npm run test:integration`, verify Contacts in the browser, test denied writes, then reconcile fields with the specification.
6. Review/apply migration 0003, build and test Projects CRUD, then define room/J&K workflows from the source specification.
7. Implement Invoices and invoice calculations/status behavior.
8. Implement Settings, Users, and Dashboard widgets.
9. Add unit, integration, and end-to-end coverage as each domain becomes functional.

## Index maintenance rule

Every structural change must be reflected here in the same change set. New routes,
API endpoints, migrations, shared modules, and major feature files must be indexed.

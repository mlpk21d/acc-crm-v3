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
| `src/db/migrations/0009_protect_permanent_status_insert.sql` | Forward-only protection against duplicate/converted permanent statuses (NOT applied) |\n| `src/db/migrations/0008_permanent_project_statuses.sql` | Seeds and protects permanent Cancelled and Archived Project Status options (NOT applied) |
| `src/db/migrations/0006_project_status_options.sql` | Allow managed project status strings while retaining existing project statuses (NOT applied) |\n| `src/db/migrations/0004_contacts_legacy_fields.sql` | Additive legacy contact attributes and filtering indexes; NOT applied to local PostgreSQL | 
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
| `/contacts` | `src/app/(crm)/contacts/page.tsx` | Legacy-style list, parameterized search/filter controls, 15-row pagination, contacted toggle and View/Edit links |
| `/contacts/new` | `src/app/(crm)/contacts/new/page.tsx` | Create contact (write permission) |
| `/contacts/[id]` | `src/app/(crm)/contacts/[id]/page.tsx` | Contact detail + soft-delete |
| `/contacts/[id]/edit` | `src/app/(crm)/contacts/[id]/edit/page.tsx` | Update contact |
| `/projects` | `src/app/(crm)/projects/page.tsx` | Searchable paginated list |
| `/projects/new` | `src/app/(crm)/projects/new/page.tsx` | Create project |
| `/projects/[id]` | `src/app/(crm)/projects/[id]/page.tsx` | Project detail |
| `/projects/[id]/edit` | `src/app/(crm)/projects/[id]/edit/page.tsx` | Edit project |
| `/settings` | `src/app/(crm)/settings/page.tsx` | Five legacy dropdown categories: Type, Region, Status, Project Status, Manufacturers |
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

Contacts validation now rejects missing submitted fields and normalizes country code. Form errors are rendered inline and deletion requires confirmation. Unit and database integration tests added (`npm run test:integration`; local DB required). Contacts has not been build-tested or browser-tested against the local PostgreSQL instance. The form now follows the original repository's three-column grouping. Legacy Region, Type, Location, Secondary Phone, Website, Status and plain-text Comments fields are supported in source code, conditional on migration 0004. Legacy Contacted toggle, contact timestamp, Settings-managed options, rich-text comment editor and field semantics are still outstanding. Form fidelity is incomplete; screenshot-by-screenshot browser validation remains outstanding. List search uses case-insensitive partial matches; pagination is 25 rows per page. No database schema migration was required.

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

## UI follow-up 2026-10-16

The sidebar now includes route highlighting, inline navigation icons, and a mobile drawer. The Contacts list still needs the legacy column/filter fidelity pass; that change has not been committed. Browser and build validation remain outstanding.

## Contacts UI follow-up

On 2026-10-16, the Contacts listing was adjusted to legacy-oriented Company, Contact, Phone, Email, Location, Type and Actions columns. Only fields supported by the V3 database are displayed. Original CRM advanced filters, status rows, contact activity and modal actions are deferred until the supporting schema and permission model are implemented. No migrations were applied. Local lint/typecheck/build and browser visual comparisons remain to be run.

## Contacts schema recovery — 2026-10-16

Migration `src/db/migrations/0004_contacts_legacy_fields.sql` restores legacy `region`, `type`, `location`, `phone_2`, `website`, `status`, `contacted`, `last_contacted_date`, and `comment` as additive fields. It creates partial filtering indexes and does not modify existing fields, source data, or permissions. The contact validation, server create/update action, reads and three-column form were updated to include applicable new fields. Existing V3 `contact_type` and `mobile_phone` are separate fields from legacy `type` and `phone_2`; mappings must be reviewed for eventual data imports.

**Deployment dependency:** Run `npm run db:migrate` before running code that queries the new columns. Migration 0003 runs before 0004 if not already applied; review both before deployment. No migrations were applied by this assistant. Local build, lint, typecheck, unit/integration tests and visual comparisons remain unverified. Original settings-driven selectable statuses/types, contacted changes and filtering modal have not yet been implemented.

## Contacts workflow update — 2026-10-16

Implemented on `main`: Contacts now supports server-side filtering on company/name/email search, region, legacy type, status, and contacted state. Filter values are derived from persisted contact records and passed through bound PostgreSQL parameters. Paging is 15 records and retains filters across pages. Added a permission-checked contacted toggle which sets/clears `last_contacted_date`, updates audit fields and revalidates list/detail paths. Contacts table now presents Company, Contact, Phone, Region, Location, Status, Contacted and View/Edit actions. New styles are in `src/app/globals.css`.

This is an incremental functional match, **not** full UI parity: the legacy modal-based filter layout, controlled status color settings, comment modal, rich text, exact ten-column list and Settings-managed option catalog are still pending. Migration 0004 is a required prerequisite for querying these fields. No migration, local build, lint, tests or screenshot comparison was run through this GitHub-only change set. Tests must be run locally, not via GitHub CI.

## Contact UI refinements — 2026-10-16

- Renamed display label `Contact Type` to `Type` (underlying `contact_type` remains unchanged). The separate legacy `type` field is labeled `Category` to avoid duplicate Type labels.
- Removed the visible required-name help text; existing validation remains enforced.
- Contacts Region uses a select fed from `public.crm_settings_options` (`category='region'`, active options, configured labels/order), with an inactive legacy value retained when editing.
- Added migration `src/db/migrations/0005_settings_options.sql` to define configurable Settings values. `/settings` now provides add/reactivate/deactivate controls for Region entries using permission-protected server actions in `src/features/contacts/region-settings-actions.ts`. No options are fabricated or seeded; configure them in Settings after migration.
- Added `src/features/contacts/contact-filters.tsx`: Contacts filters now open from a top-right **Filters** button immediately before **Create Contact**, in a right-side slide-in panel. Existing URL-based filters and server-side query semantics remain intact. Styling lives in `src/app/globals.css`.
- **Migration prerequisite:** apply 0005 after earlier pending migrations before loading the updated Region form and Settings page. GitHub code changes only; no database migration or local build/test/browser verification performed.

## Settings dropdowns — 2026-10-16

Restored the original CRM dropdown category controls: Type (`type`), Region (`region`), Status (`status`), Project Status (`project_status`), and Manufacturers (`manufacturer`). Original source reference: `mlpk21d/acc-crm/src/pages/admin/Settings.tsx`. V3 uses the existing `public.crm_settings_options` catalog introduced by migration 0005. No further migrations were added.

- `src/features/settings/dropdown-settings.tsx`: category tabs, add, inline label/color editing, enable/disable, stable ordering controls and retirement.
- `src/features/settings/dropdown-actions.ts`: permission-checked parameterized SQL writes and transactional reorder, with cache revalidation.
- `src/app/(crm)/settings/page.tsx`: loads all five categories on the Dropdown Options tab.
- `src/app/globals.css`: original-style tab, list, swatch, and action styling.
- Colors apply to Status, Project Status and Manufacturers. Retirement is soft (inactive) to preserve historical references. No bulk legacy option values were invented or seeded.
- Explicitly deferred: Export, Import, Signup Links, project-room/manufacturer consumers, fully Settings-driven Contact Type/Status selects, and screenshot-perfect browser acceptance.

Migration 0005 must be applied locally before Settings can load; no migrations, local build, typecheck, lint, or tests were executed in this change set. GitHub CI was not used.

## Screenshot-specific Settings refinement — 2026-10-16

Reference screenshots supplied in conversation: `option1.png` (Type add-option row), `option2.png` (Project Status add-option row). Matched inline add input placement directly beneath category card heading, adjacent color picker for Status/Project Status/Manufacturers, compact dark Add button, cancel X, and right-aligned compact option actions, numeric order, swatches and active status badges. Files: `src/features/settings/dropdown-settings.tsx`, `src/app/globals.css`. Underlying dropdown CRUD behavior unchanged. Export, Import, and Signup Links intentionally deferred. No browser/build validation performed.

## Settings-driven Contact dropdown integration — 2026-10-16

The Contacts create/edit pages now load the active `type`, `region`, and `status` categories through `getContactDropdownOptions()` from `src/features/contacts/data.ts`; `ContactForm` renders select controls and preserves a currently stored inactive value when editing. The Settings-managed legacy `type` catalog is now the **sole visible Type field** in Contact create/edit. The foundational `contact_type` Person/Business attribute remains internal for schema compatibility (preserved for edits, defaulting to business for new records); no duplicate Type/Category field appears. The migration prerequisite is still 0005. This change has not been locally compiled or browser tested. Export, Import, and Signup Links remain out of scope.

## Contact Type ambiguity resolved — 2026-10-16

The Contact form displays exactly one **Type** selector, sourced from Settings category `type` and persisted to `contacts.type`. The original Person/Business `contacts.contact_type` field is no longer visible; the form submits its existing value on edits, defaulting to `business` on creates to satisfy the existing schema without a new migration. This internal compatibility field must not be confused with the user-facing legacy Type options. No database migration was changed. Export/Import/Signup Links remain deferred. This commit was not locally built or browser tested.

## Projects status integration — 2026-10-16

- Migration `src/db/migrations/0006_project_status_options.sql` removes the provisional fixed-enum CHECK and replaces it with a nonblank/length CHECK. Existing statuses remain intact. Migration 0005 is prerequisite.
- `src/features/projects/data.ts` loads active `project_status` options from `public.crm_settings_options`, ordered by configured sort order, and treats the project status as a string.
- `src/features/projects/project-form.tsx` now uses the Settings → Project Status dropdown; stored inactive statuses are retained for existing projects.
- `src/features/projects/validation.ts` permits safe-length status values; `src/features/projects/actions.ts` checks that new selections are active in Settings, or an unchanged legacy value on edit. Project create/edit route files pass option lists to the form.
- Manufacturer selection remains deferred until project rooms are implemented and matched to the legacy UI. No changes made to Export, Import, or Signup Links.
- **Local action required:** Review and apply pending migrations (including 0006) before running this Projects code; no local migrations, build, typecheck, tests or screenshot comparisons were performed.

## Room/manufacturer foundation — 2026-10-16

- Migration `src/db/migrations/0007_project_rooms_foundation.sql` adds **nonfinancial** project rooms including ordered room details and manufacturer string. This is a new, unapplied migration.
- `src/features/projects/rooms-data.ts` reads rooms with manufacturer colors and loads active `manufacturer` Settings entries.
- `src/features/projects/rooms-actions.ts` adds server-authorized room inserts with active manufacturer validation. No costs or admin-only financial data are present.
- `src/app/(crm)/projects/[id]/page.tsx` displays room rows and offers an initial Add Room form for project writers. `src/app/globals.css` styles the section.
- **Known fidelity gap:** this initial nonfinancial add form is not yet the original RoomEditorModal. Editing, deletion, ordering controls, Rev-A-Shelf, J&K cabinet configuration and administrator-only costs remain to be implemented; follow screenshot acceptance references.
- Migration order: 0005, 0006, 0007 after earlier pending migrations. No local migrations or build/browser tests executed, and GitHub CI not used.

## Permanent Project Statuses — 2026-10-16

- `src/db/migrations/0008_permanent_project_statuses.sql` seeds **Cancelled** and **Archived** in `crm_settings_options` under `project_status`, reuses existing case-insensitive matches, marks them active, and adds a PostgreSQL trigger protecting them against deletion, deactivation and renaming. Configured colors and order are preserved for existing rows.
- `src/features/settings/dropdown-actions.ts` blocks deactivation and retirement for these two options and permits color edits while retaining the fixed names; reorder actions remain available.
- `src/features/settings/dropdown-settings.tsx` marks these two options Permanent, shows their names read-only while editing colors, and removes deactivate and retire actions. CSS styling in `src/app/globals.css`.
- No application-side hard delete is used for other options. Migration 0008 must be applied locally after earlier numbered migrations; no database changes were executed by this assistant. Build and browser tests remain unverified.

## Permanent status hardening — 2026-10-17

- `src/db/migrations/0009_protect_permanent_status_insert.sql` is a forward-only migration (does **not** modify the checksummed 0008 migration). It extends the PostgreSQL permanent-status trigger to prevent inserts or conversions that would create case-variant `Cancelled`/`Archived` values, while preserving permitted color and sort-order updates.
- `src/features/settings/dropdown-actions.ts` now rejects attempts to add permanent statuses through the generic Add Option action; rename/deactivate/retire remain blocked.
- Existing permanent statuses stay active, sortable and color-editable. Apply migrations through 0009 in version order locally. No migration or automated/browser tests were executed here. Export, Import and Signup Links remain deferred.

## Project Room modal iteration — 2026-10-17

- `src/features/projects/project-rooms.tsx`: replaces the temporary inline Add Room form with an Add/Edit Room modal, preserves the original room field groupings, uses Settings-managed Manufacturers (including existing inactive selection), and adds delete confirmation. The room table is retained on project details.
- `src/features/projects/rooms-actions.ts`: server-side project-writer authorization for insert, update and delete, room/project association checks on update/delete, and manufacturer validation that permits the unchanged previously stored inactive manufacturer.
- `src/app/(crm)/projects/[id]/page.tsx`: delegates room list and actions to the interactive component. Modal CSS is in `src/app/globals.css`.
- **Not yet complete:** keyboard focus trapping, room reordering, Rev-A-Shelf, J&K configuration, financial values restricted to admins and browser screenshot acceptance. Migration 0007 is required for rooms. No local build, migrations or tests were run; GitHub CI not used. Export/Import/Signup Links remain untouched.

## Room ordering and Rev-A-Shelf — 2026-10-17

- `src/db/migrations/0010_rev_a_shelf_items.sql`: new Rev-A-Shelf accessory table with ordered items, cascading room relationship, and index (NOT applied locally).
- `src/features/projects/rooms-data.ts`: rooms now include ordered `ras_items` via a JSON aggregation. The `manufacturer` Settings catalog remains the room dropdown source.
- `src/features/projects/rooms-actions.ts`: permission-protected up/down movement using a project-scoped row lock and transactional sort order writes; validated add/remove accessory actions restricted to the matching active project and room.
- `src/features/projects/project-rooms.tsx`: up/down controls appear in the room table; Rev-A-Shelf counts appear below room names and stored item management appears in the Add/Edit Room modal for existing rooms. Room details are saved separately from accessories in this iteration.
- `src/app/globals.css`: compact legacy-like controls without changing navigation or page layout.
- **Remaining:** Rev-A-Shelf item editing/reordering, keyboard focus trap for modal, J&K configuration, admin-only room cost, full screenshot acceptance and QA. Migrations must be applied in order through 0010. Local build, tests and browser verification not run; no GitHub CI.

## Migration troubleshooting — 2026-10-17

User reports `npm run db:migrate` skips 0001–0007 and then fails with PostgreSQL `syntax error at end of input`. Because 0008 is the next version, it is the first suspect, but the prior output did **not** identify a filename or SQL location. Updated `scripts/db/migrate.mjs` to log each pending filename before execution and wrap SQL errors with filename, PostgreSQL character position and diagnostic context. Existing applied migration checksums and transactional rollback behavior remain unchanged. **Await new runner output before editing a versioned migration.** No local PostgreSQL execution or remote migration was performed.

## Migration SQL fix — 2026-10-17

Local migration output located syntax failure in `0008_permanent_project_statuses.sql` at character 1410, at the `CASE WHEN ... THEN` expression embedded inside a PL/pgSQL `IF` predicate. Replaced it with `initcap(lower(OLD.value))` in the protection check to avoid parser ambiguity; applied the same fix proactively to unapplied migration 0009. Migration 0008 had failed and rolled back, so its checksum has **not** been recorded; updating its file is safe for this reported database, but environments where 0008 was applied must not silently modify recorded history. No local PostgreSQL run was available. Run `npm run db:migrate` after pulling and report any subsequent failure.

## J&K cabinet configurator foundation — 2026-10-17

- New pending migration `0011_jk_cabinet_foundation.sql` adds `jk_price_items` (confidential catalog), `jk_room_configs` (per-room assembly count and lock flag) and `jk_room_cabinet_items` (ordered per-room price snapshots with hinge direction, quantity, custom item flag). The foreign keys cascade cabinet configurations and selections when a room is deleted.
- `src/features/projects/jk-data.ts` adds server-only, **administrator-gated** catalog search and room-config reads using `requirePermission("settings:manage")` (admin-only in current role matrix). The generic Project read path never returns pricing.
- Original `src/pages/projects/JkConfigModal.tsx` is the reference for future UI: catalog search, custom items, 20% catalog discount, hinge selection, quantities, item ordering, $20 per assembly, and apply/locked room-cost calculations.
- **Not implemented yet:** catalog import, admin write API/configurator modal, financial synchronization and server-owned cost calculation. Do not expose pricing through client props for non-admin users. Migration 0011 has NOT been run; status of preceding 0008–0010 after the reported SQL syntax correction has not been confirmed by user. No build/typecheck/QA performed, no GitHub CI.

## J&K transactional configuration backend — 2026-10-18

- `src/features/projects/jk-actions.ts` adds `saveJkConfiguration`: an administrator-only server action (current `settings:manage` admin role), accepting a validated room-scoped catalog/custom item list and assembly count. It locks the selected room, verifies its manufacturer is J&K, queries current active catalog prices on the server, computes a 20% discount in integer cents, stores immutable unit/discounted price snapshots and ordered quantities, and calculates $20 per assembly. The operation uses a single transaction and prevents changes to unrelated rooms.
- The server response includes a calculated total, but **does not update financial room/project totals yet**. This is intentional: admin-only financial columns and their integration remain pending. Catalog administration/import and the visual J&K configuration modal remain pending.
- The legacy screenshot/UI remains the acceptance target. New migrations through `0011` must be applied in order. Local migrations, compile and browser QA have not been verified; no GitHub CI.

## J&K configurator user interface — 2026-10-19

- `src/features/projects/jk-configurator.tsx`: admin-only room configurator modal with debounced catalog search, catalog/custom item selection, L/R hinges, quantities, item ordering, per-line discounted prices, assembly count, and calculated total. Calls server-owned `saveJkConfiguration` and shows authoritative returned total.
- `src/features/projects/jk-actions.ts`: authenticated admin-only search and room-load actions using server-only `jk-data.ts`; configuration save remains transactionally validated and priced on the server.
- `src/features/projects/project-rooms.tsx` and `src/app/(crm)/projects/[id]/page.tsx`: show Configure J&K Cabinets action for admins editing existing rooms assigned manufacturer `J&K`; ordinary project readers/writers without administrator status do not see pricing controls.
- `src/app/globals.css`: original-style modal/table input styling, responsive horizontal scroll.
- **Known limits:** J&K price catalog is not seeded/imported; catalog search will be empty until supplied. Configuration saves do not update `project_rooms.room_cost` or project financial totals; admin financial schema pending. Full fidelity keyboard focus management, browser screenshot comparison, migration execution and local build/typecheck remain pending. No GitHub CI. Settings Export/Import/Signup Links untouched.

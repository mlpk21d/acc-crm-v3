# ACC CRM V3 Project Index

Last updated: 2026-10-27

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
| `src/lib/auth.ts` | Server-only runtime Better Auth instance with explicit configured base URL and same-origin trust |
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
| `src/features/auth/login-form.tsx` | Email/password sign-in form; distinguishes cross-site navigation security rejection from credential errors |
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
| `src/features/projects/data.ts` | Project detail, active contact choices, and project status options |
| `src/features/projects/list-model.ts` | Column inventory, nine-column default, filter/result contracts, administrator-only column gating |
| `src/features/projects/list-data.ts` | Authorized server-side search, status/featured filters, sorting, 15-row pagination, numeric financial summaries, saved column reads |
| `src/features/projects/list-actions.ts` | Permission-checked asynchronous search, featured updates, and per-user column preference writes |
| `src/features/projects/project-list.tsx` | Live search, yellow featured stars, bold names, configurable table, right-side filter dialog and pagination |
| `src/db/migrations/0014_project_list.sql` | Featured flag, active list indexes, and user_project_list_columns preferences; run before serving the updated list |
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

## J&K search lint correction — 2026-10-19

Fixed React `react-hooks/set-state-in-effect` lint error in `src/features/projects/jk-configurator.tsx`: the search effect no longer clears results synchronously; the input change handler clears prior matches immediately and the results list is hidden for an empty query. This retains debounced lookup and stale-result cleanup. Local lint/typecheck not executed; user should rerun `npm run check`.

## Project View/Edit layout restoration — 2026-10-19

- Compared the V3 Project View/Edit routes with the legacy `mlpk21d/acc-crm` source `src/pages/projects/ProjectView.tsx` and `ProjectForm.tsx` (the original screenshot ZIP was not available in the current file context).
- `0012_project_details_checklist.sql` extends `public.projects` with nonfinancial address, project contact name/phone, designer, next step, sample signoff status, order/start/install dates and notes; adds seven-field `public.project_checklist` keyed by project with cascading delete.
- `src/features/projects/data.ts` reads those details and joins checklist through a scoped separate query. `validation.ts`, `actions.ts` and `project-form.tsx` accept and persist the same field set, with the original Project Details card, Notes and Checklist hierarchy.
- `src/app/(crm)/projects/[id]/page.tsx` uses legacy Project View hierarchy: back/title/edit, status, full-width 4-column details, 50/30/20 section area, rooms last. `src/app/globals.css` provides responsive card/field styles in the established palette.
- **Not yet parity complete:** old project's admin-only Financial Summary, room costs, rich-text Notes editor, PDF actions and screenshot-by-screenshot comparison require separate protected implementation. V3 currently shows a nonfinancial Project Information card in the first 50%-width slot instead; this must be revisited with the screenshots. Also review project creation/edit saves and migration 0012 during QA.
- No database migrations, local builds, lint/typecheck or browser visual acceptance run from this assistant session. Earlier migrations 0008–0011 are not confirmed applied. No Github CI. Export/Import/Signup Links untouched.

## Administrator Project Financial Summary — 2026-10-19

- **Migration 0013**: `src/db/migrations/0013_project_financials.sql` adds isolated `project_financials` and `project_room_financials` tables with nonnegative money/check constraints, room discounts 0–100%, and margins 25%/35%/custom. No existing checksummed migrations modified.
- **Server reads and calculations**: `src/features/projects/financial-data.ts` uses `requirePermission("settings:manage")` before loading any costs, computes discounted room sums, project operating costs, selling total and profit using the legacy `Total / (1 - Margin)` formula. No financial columns are selected in generic `getProject` or `listProjectRooms`.
- **Server writes**: `src/features/projects/financial-actions.ts` validates submitted money and discount/margin fields, checks active parent project/room association and requires admin-only settings permission. Saves project and room costs separately so nonadmin project edits cannot overwrite financial fields.
- **UI**: `src/features/projects/project-financial-panel.tsx` presents legacy financial fields, margin choice, room cost/discount editor, and financial summary cards. Mounted only for admin in `src/app/(crm)/projects/[id]/page.tsx` (left financial panel) and `src/app/(crm)/projects/[id]/edit/page.tsx` (isolated editor below main project form). CSS updated, navigation preserved.
- **Known limits / QA**: migration 0013 not yet executed; run `npm run db:migrate` then `npm run check` locally. J&K generated prices do not yet synchronize automatically to the room cost field. Full legacy screen fidelity and browser tests pending. Authorization is at server action/query boundaries, not PostgreSQL RLS for the application's privileged database account. Creation of a new project must complete before its separate financial edit. No GitHub CI used.

## J&K room financial synchronization — 2026-10-19

- J&K save now writes the recalculated server-owned cabinet total (including assembly charges) to `project_room_financials.room_cost` in the **same transaction** as the `jk_room_configs` and cabinet item snapshots. An existing `manufacturer_discount` is preserved; a newly configured room defaults to zero extra manufacturer discount. No client-entered total is trusted.
- Admin `saveRoomFinancials` refuses overrides when `jk_room_configs.locked=true`. The admin-only financial query returns `jk_locked`, which disables the corresponding room cost/discount controls and indicates that pricing comes from the J&K cabinet configurator. No J&K financial values are added to the standard Project or Room data paths.
- User reported that **no UI changes were visible**. GitHub commits update the repository, not an already-running local app or a deployed instance. The live instance/branch, latest pulled commit, applied migrations, and role must be confirmed during local QA. A manager/staff user will not see admin-only financial controls.
- **QA required:** `git pull origin main`, `npm run db:migrate`, `npm run check`, restart local Next.js dev server, navigate to existing `/projects/[id]` and `/projects/[id]/edit` as an admin, and compare against original screenshots. Do not claim these tests ran remotely. Settings Export/Import/Signup Links remain out of scope.

## Project Edit Financial Summary placement correction — 2026-10-19

- Original Project Edit shows the administrator-only Financial Summary **in the first (50%) column beside Notes (30%) and Checklist (20%)**. Previously V3 rendered the financial editor below the entire Project form, making it visually inconsistent and easy to miss.
- `src/features/projects/project-form.tsx` now accepts a server-supplied `financialPanel` slot inside the existing three-column layout. Project Details use their own form element; Notes, Checklist, and Save Changes associate to that project form via HTML `form` attribute, avoiding invalid nested forms with the separate admin financial editor. Description remains in the details card for admin users and in Project Information for nonadmins.
- `src/app/(crm)/projects/[id]/edit/page.tsx` supplies the slot only when `user.role==="admin"`. `src/app/globals.css` has matching spacing rules. Admin financial read/write protection remains on the server; user role controls visibility.
- If Financial Summary is still absent, verify the running checkout has latest `main` and the current authenticated CRM role is `admin`. Exact visual comparison and local build remain unverified.

## Initial Project creation financial summary — 2026-10-19

- New Project route `src/app/(crm)/projects/new/page.tsx` now supplies an admin-only `NewProjectFinancialFields` panel to the existing `ProjectForm` 50/30/20 layout, alongside Notes and Checklist, mirroring the edit/view layout.
- `src/features/projects/new-project-financial-fields.tsx` lets administrators enter Install, Misc, Drawing, Freight and Doors/Pulls costs and 25%/35%/custom margin **before** a project ID exists. All inputs associate with the existing `crm-project-core-form` through HTML `form` attributes; preview includes Total, Total Cost and Profit, with Room Costs initially zero.
- `src/features/projects/actions.ts` validates the financial payload only for the admin permission `settings:manage` and saves the project, initial financial values and checklist together in **one PostgreSQL transaction**. Failure rolls back all three. Existing editing without financial fields remains unchanged; nonadmins cannot inject financial parameters.
- No new migration: existing applied `0013_project_financials.sql` supports initial rows. Room costs require a saved project/rooms and are edited later.
- QA still required on user machine: `git pull origin main`, `npm run check`, create a project as admin with custom margin and confirm financial values on subsequent Project View/Edit; test nonadmin cannot read/submit financial values. No local QA/build performed here; screenshot acceptance pending.

## Initial Project Rooms staging — 2026-10-19

- `src/features/projects/new-project-rooms.tsx` adds a client-side room staging panel on `/projects/new`, below the Project Details / Financial Summary / Notes / Checklist: add, edit, delete, reorder rooms; room name, door/drawer style, species, finish, construction, manufacturer; administrator-only initial room cost and manufacturer discount; Rev-A-Shelf item name/code/link.
- The staged `initial_rooms` JSON is attached to the existing Project create form using its `form` attribute. `src/app/(crm)/projects/new/page.tsx` loads active manufacturer options and supplies the rooms panel; `src/features/projects/project-form.tsx` renders the panel before Save/Cancel.
- `src/features/projects/actions.ts` parses and bounds the room payload, restricts room costs to administrators, validates manufacturers against active settings, then inserts project, checklist, project financials, rooms, room financials, and accessories in one database transaction. Failed inserts roll back all related records. No new migration required.
- **Still pending full legacy parity**: pre-save J&K catalog cabinet configuration for a newly staged room (existing configurator requires a persisted room UUID), richer Notes editor and the original room modal visual details. The New Project financial preview currently shows Room Costs as zero until the project is saved and room financials load on its View/Edit page. No local lint/typecheck/runtime verification performed, and screenshot ZIP currently unavailable. Never claim complete all-fields parity until those gaps are closed.

## New Project room modal screenshot alignment — 2026-10-19

- `src/features/projects/new-project-rooms.tsx`: initial Add/Edit Room modal now follows the provided ROOM.png reference: two-column ordering Room Name / Room Cost, Door Style / Species, Drawer Style / Finish, Construction / Manufacturer, separate accessory area and footer actions; admin-only cost and manufacturer discount remain permission-scoped.
- Rev-A-Shelf fields are hidden initially. Clicking `+ Add Item` reveals Item Name, Code, Link and Save Item/Cancel; Save Item adds a draft accessory and collapses inputs. Existing items can be removed. No premature DB writes; all drafts persist with initial Project create transaction.
- `src/app/globals.css`: scoped `crm-new-room-*` styling matches reference width, spacing, borders, labels and action buttons; existing global dialog styles remain unchanged.
- Visual and accessibility QA pending in local browser; no build or lint run remotely. Other existing room dialog and J&K pre-save configuration are separate parity tasks.

## Room modal second screenshot refinement — 2026-10-19

- `src/features/projects/new-project-rooms.tsx`: Room Cost and `Mfr Discount %` are now two adjacent inputs sharing the right half of the first form row, beside Room Name; removed separate trailing discount row.
- Rev-A-Shelf `+ Add Item` appends an editable row immediately with Item Name, Code, Link, and red × remove control. No Save Item or Cancel controls. A single `Save Room` persists all room/accessory draft values; blank item names and malformed nonempty links block draft save (backend independently validates them).
- `src/app/globals.css`: scoped two-column cost grouping and responsive three-input accessory-row styling, preserving original room dialog visual language and untouched sidebar/navigation.
- Local lint, build and browser visual QA still pending.

## Project Contact link modal — 2026-10-19

- `src/features/projects/project-contact-picker.tsx` supplies a Project Contact text input plus magnifying-glass **Link** button, matching `project-form-1.png` and `project-form-2.png`. Clicking opens a contact search dialog with name/company substring autocomplete, selection, Escape dismissal, and a 25-result display cap. Selecting a CRM contact fills the displayed name, linked contact UUID, and phone; editing text clears the UUID and previously linked phone.
- `src/features/projects/project-form.tsx` integrates the picker for New Project and Edit Project, replacing the Contact dropdown and separate Contact Name / Contact Phone fields. The existing project financials, schedule fields, notes, and checklist are preserved.
- `src/features/projects/data.ts` extends `contactChoices` to provide phone along with ID and label. Lookup currently loads the first 500 contacts; database-driven search beyond that limit remains a follow-up for large lists.
- `src/app/globals.css` provides scoped picker and modal styling without changes to general layout/navigation. No migration needed; existing `contact_id`, `project_contact_name`, `project_contact_phone` persistence continues unchanged.
- Local lint/build and browser screenshot QA not yet run.

## Project Contact icon dependency fix — 2026-10-19

- `src/features/projects/project-contact-picker.tsx` no longer imports unavailable `lucide-react`; the Link button uses an inline accessible magnifying-glass SVG, preserving the existing visual and avoiding a new package dependency. Resolves reported TS2307. Local typecheck still needs user verification.

## Project form parity follow-up — 2026-10-19

- `src/features/projects/project-form.tsx`: Project Name now spans two of four desktop columns (50%); Project Address label; both Project Status and Next Step use the same Settings-driven project-status option list, with a project-specific Custom... modal; Sample Signoff Status is Select... / Pending / Approved; Description is no longer displayed.
- `src/features/projects/actions.ts` and `validation.ts`: allow project-specific custom statuses after explicit modal selection, retain existing inactive statuses, and validate Sample Signoff. Custom statuses are stored on the project, **not** added to the global Settings option catalog. No schema change.
- `src/features/projects/project-financial-panel.tsx`: New/Edit Project financial fields submit with the main Project form. Removed separate Save Financials button and duplicate Room Costs section beneath financial cards. On Project View, financial inputs are read-only and edited via Edit Project. Room cost editing remains in room-specific workflows and needs parity QA.
- `src/features/projects/project-rooms.tsx` and `new-project-rooms.tsx`: centered italic empty-state text appears instead of table headers when there are no rooms; Add Room button uses lighter charcoal background.
- `src/app/globals.css`: scoped styling for the above; `src/app/(crm)/projects/[id]/edit/page.tsx` passes editable financial mode; details view labels standardized.
- No migration required. Local typecheck, build, browser tests, financial persistence and visual fidelity are **not yet verified**. User runs tests locally without GitHub CI.

## Project Rooms view/edit separation — 2026-10-19

- `src/app/(crm)/projects/[id]/page.tsx`: Project View forces `canEdit={false}` and displays room columns without any Add Room, edit, delete, reorder or J&K action controls.
- `src/app/(crm)/projects/[id]/edit/page.tsx`: Project Edit now loads rooms and manufacturer choices for all project editors (not just admins) and passes an editable `ProjectRooms` section into the existing project edit form layout.
- `src/features/projects/project-rooms.tsx`: Order/Actions columns are exclusive to Edit; Project View renders only room information columns. Read-only empty state omits instruction to click the edit-only Add Room button.
- No migrations. Local `npm run check` and browser verification still required. Room actions remain individually server-permission-checked.

## Persisted Room Edit modal financial fields — 2026-10-19

- Restored Room Cost and Mfr Discount % as an adjacent pair in `src/features/projects/project-rooms.tsx`, restricted to admins and populated from persisted `project_room_financials`.
- `src/app/(crm)/projects/[id]/edit/page.tsx` supplies the financial room values; `src/features/projects/rooms-actions.ts` saves room details and optional financial values transactionally, with a server-side admin permission check and a J&K locked-cost guard. Non-admin project editors cannot submit room financial values.
- Added scoped styles to `src/app/globals.css`. Room View remains read-only. No migration. Local compilation and browser verification required.

## Room edit modal first-row alignment — 2026-10-19

- Existing Project Edit Add/Edit Room modal places Room Name in the first left 50% grid cell and places Room Cost / Mfr Discount % side-by-side inside the right 50% grid cell (each half that cell). Remaining fields retain order, financial permissions, and persistence behavior. Mobile keeps the two financial fields paired. CSS change is scoped; no migration required. Local visual/typecheck verification pending.

## Financial Information screenshot fidelity — 2026-10-20

- `src/features/projects/project-financial-panel.tsx` and `new-project-financial-fields.tsx`: use screenshot section heading “Financial Information (Admin Only)” and dark highlight for both Total Cost and Profit cards.
- `src/app/globals.css`: preserve the six-input order (Install Cost, Misc Cost, Drawing Cost / Freight, Doors/Pulls, Margin) in a three-column grid, with Room Costs, Total, Total Cost, Profit arranged as a single row of four cards. Narrow-screen fallback uses two columns or one column as appropriate.
- Calculations, field names, submission behavior and permission boundaries unchanged. No database migration. Local check and screenshot comparison still required.

## ACC logo branding — 2026-10-20

- `src/components/app-shell.tsx`: replaced the text “ACC CRM” in the desktop sidebar, mobile drawer, and mobile header with the already committed `public/images/acc-logo.svg` using `next/image`. Logo links to dashboard.
- `src/app/globals.css`: scoped logo sizing to existing sidebar/mobile header heights without altering navigation, typography, or shell layout.
- No migration. Local `npm run check` and visual verification required.

## Button icon consistency — 2026-10-20

- Introduced `src/components/button-icon.tsx`: reusable, accessible, inline SVG glyphs for add, edit, save, delete, search, filter, close, move, authentication, and related buttons. Icons inherit currentColor; no icon library dependency.
- Added paired action icons to native buttons throughout Projects, Contacts, Settings, authentication, the J&K configurator, and the application shell; retained existing button action handlers and field semantics.
- Existing navigation/menu buttons with inline `NavIcon` or existing magnifying-glass SVG already satisfy icon requirements. Backdrop buttons contain a hidden close glyph and preserve the full-screen click-dismiss affordance.
- `src/app/globals.css` keeps overlay dismiss controls visually empty. Project-specific UI positioning is unchanged. Button icons are now a requirement for newly added buttons; use `ButtonIcon` instead of bare text.
- No database migration and no GitHub CI. Run `npm run check` and review the affected pages locally; local compilation and browser verification were not available through this repository-only edit.

## Contact delete lint correction (2026-10-20)

- Moved the client component directive to the beginning of `src/features/contacts/delete-contact-form.tsx`, ahead of imports, to address ESLint unused-expression warning. No behavior changes or migrations; local verification pending.


## Project list parity — 2026-10-20

- `/projects` now follows the supplied `project-list-page.png` and `fitlers.png`, with `mlpk21d/acc-crm/src/pages/projects/ProjectList.tsx` reviewed for existing behavior.
- Default columns follow the user's explicit list: Project Name (bold), Current Status, Next Step, Order By Date, Official Start Date, Install Date, Contact, Profit, Total Cost. Sample Signoff, Drawing Approved and Last Edited are initially hidden and available in Column Display. Featured and action columns are always present.
- Profit and Total Cost remain administrator-only; unauthorized queries do not select or join financial tables. Financial summaries use PostgreSQL numeric arithmetic and the existing discounted-room / margin formula.
- Search has an inline magnifier, clear control, no submit button, and a 250 ms debounce. Requests apply only while current; search/filter/sort changes reset pagination.
- Right-side native modal dialog provides focus containment, Escape dismissal, backdrop dismissal, scroll locking and focus restoration. Current Status and Featured Only apply together; Reset clears those filters, preserving search and column preferences as in V2. Column switches save immediately per CRM user.
- All new buttons contain icons; featured stars fill yellow. Featured saves are optimistic, permission-checked, audited, disabled while pending, and rolled back with a visible error on failure.
- Retains V2 default exclusion of Cancelled/Canceled and Archived records unless a status is selected. Status row colors and View/Edit actions are preserved. List sorts server-side with a stable ID tiebreaker and uses 15-row pages.
- Migration 0014 adds the featured flag, partial indexes for updated/featured/status list ordering, and legacy-named per-user hidden-column preferences. No existing migration is changed. Apply with `npm run db:migrate` before starting the updated application. No production database was accessed.
- Validation: `npm run check` passes (lint with no warnings, TypeScript, 7 existing unit tests); production build passes with placeholder environment configuration. Auth reports expected database-connectivity warnings because no live database is configured. Isolated PGlite checks passed for migrations, financial numeric rounding, status/featured/name filters, literal wildcard handling, pagination and non-admin financial exclusion. Browser interaction/visual verification remains unconfirmed: Chromium download failed in this environment.


## Project list, edit and contact corrections — 2026-10-20

- `/projects`: Project Name has a blue underline hover/focus treatment and is permanently visible. Its switch is removed from Column Display; both saved-preference reads and writes discard an older hidden `project_name` value.
- Featured Only On/Off now immediately updates the active server filter and resets pagination. Previously it only changed draft state until Apply. Current Status still uses Apply.
- `src/features/projects/project-list.tsx`, `list-data.ts`, `list-actions.ts`: above filter/column corrections; server filtering remains permission checked and parameterized.
- `src/features/projects/project-rooms.tsx`: layered Rooms icon and count, one leading Add Room icon, full manufacturer-colored rows, and final administrator-only Cost column using saved room prices formatted as USD. Detail and edit pages share this room table.
- `src/features/projects/new-project-rooms.tsx` and `rooms-data.ts`: matching room heading/add treatment, manufacturer color choices for draft rows, final admin Cost column, and named reorder controls. No cost values are added to general room queries.
- `src/features/projects/project-form.tsx` and `src/app/globals.css`: rounded Cancel action with icon; Cancel and Save Changes align right; shared font family, 14px size, 500 weight and 20px line height for project editor buttons, including room dialogs. Removes duplicate add/close glyphs in affected controls.
- `src/features/projects/data.ts`: project detail reads include linked contact phone/company; contact choices include company and support searching by company even when a person name is present.
- `src/features/projects/project-contact-picker.tsx`: selected contact phone link and muted name/company summary, plus company/phone in search results. Existing text field and Link interaction are retained.
- `src/app/(crm)/projects/[id]/page.tsx`: contact name, blue telephone link and muted contact/company line follow `Project Contact.png`; admin room financials are now passed into the shared room table. Rooms styling follows `Rooms and Record Info.png`.
- Validation: lint, TypeScript and 7 unit tests pass. Production build passes with placeholder environment values and expected missing-live-database auth warnings. Chromium fixture checks passed for immediate featured filter requests, mandatory title column, search, feature rollback, room icon/count, single Add Room icon, last admin Cost column, manufacturer row color, contact phone/company, rounded right-aligned actions and uniform typography (including room modal); no browser errors. PGlite checks validate actual featured predicates, financial exclusion and older saved hidden-title preference handling. No live application database was accessed; no new migration required.

## Project Edit room actions and density — 2026-10-20

- `src/features/projects/project-rooms.tsx`: editable room tables now put Actions after the administrator Cost column. Edit/Delete are icon-only buttons with room-specific accessible labels and tooltips; existing edit and delete-confirmation handlers are retained.
- `src/app/globals.css`: neutral Edit hover and red Delete hover/focus treatments, compact 32px action targets, 8px vertical cell padding, compact reorder controls without inherited form margins, and 10px outer cell radii. Manufacturer color is painted on individual cells via a row CSS variable so rounded corners are visible rather than covered by the row background.
- Validation: lint and TypeScript pass; browser fixture checks verify the final Actions column, red Delete icon, both hover states, icon-only accessible controls, editor/delete-dialog behavior, rounded corners and a room row height at most 54px. Admin cost visibility and shared form typography remain covered. No migration needed.

## Project header navigation and margin note — 2026-10-20

- `src/app/(crm)/projects/[id]/edit/page.tsx`: adds a top Back link with arrow icon targeting the current Project View page.
- `src/app/(crm)/projects/[id]/page.tsx`: places the status badge immediately to the right of the project title in a wrapping title row; uses the shared arrow icon for Back to Projects.
- `src/components/button-icon.tsx`: adds the reusable `arrow-left` icon.
- `src/app/globals.css`: both Back controls use 15px semibold text with hover/focus treatment. The shared financial margin note uses 12px, light gray, italic text on View and Edit; its selector overrides the broader panel paragraph rule.
- Validation: lint, TypeScript and whitespace checks pass. No data or migration changes.


## Project Details Designer field order — 2026-10-20

- `src/features/projects/project-form.tsx`: moves Designer after Sample Signoff Status. The desktop row now reads Project Status, Next Step, Sample Signoff Status, Designer. The shared create/edit form retains the same field names and save behavior.
- Validation: inspected field order and ran lint; no migration required.

## Project information grouping and Settings icon cleanup — 2026-10-20

- `src/features/projects/project-form.tsx`: swaps Designer and Project Contact. Desktop first row: Project Name (two columns), Project Address, Designer. Second row: Project Status, Next Step, Sample Signoff Status, Project Contact. Shared create/edit form field names and persistence remain unchanged.
- `src/app/(crm)/projects/[id]/page.tsx`: detail first row is Project Address, Current Status, Next Step, Designer; second row is Order By Date, Official Start Date, Install Date, Sample Signoff Status. Contact remains below these rows.
- `src/features/projects/data.ts`: project reads include the configured Project Status color through a unique category/value LEFT JOIN, including inactive statuses still referenced by a project. Missing settings retain the project and neutral badge fallback.
- Project View title status badge uses the configured hex background with light/dark text for readability.
- `src/features/settings/dropdown-settings.tsx`: removes duplicate text glyphs beside SVG icons from order, Edit, Activate/Deactivate, Add Option and Cancel Adding controls across all categories. Reorder uses matching up/down icons; inactive options show a check icon to activate. Existing actions and accessible labels remain intact.
- Validation: lint, TypeScript and whitespace checks pass. No migration required.

## J&K cabinet configuration from Add/Edit Room — 2026-10-20

- `src/features/projects/project-rooms.tsx`: Manufacturer is now tracked while editing. Selecting J&K immediately reveals the administrator-only Configure J&K Cabinets button with a left cabinet icon, including for a brand-new unsaved room. The room stays mounted and inert beneath the second modal. Applying configuration updates the displayed Room Cost; Save Room persists the room and cabinets. Cancelling the configurator preserves the room fields and any previously applied draft; switching manufacturers discards the J&K draft.
- `src/features/projects/jk-configurator.tsx`: supports both existing room configurations and a local draft (`initialConfig` / `onApply`) without requiring a saved room ID. Retains catalog search, custom items, hinge selection, quantities, reordering, discounted prices and assembly count. Adds keyboard focus containment/Escape dismissal and blocks Apply when existing configuration loading failed. Affected cabinet controls use single icons.
- `src/features/projects/jk-model.ts`: shared serializable cabinet/draft types and cent-based draft-total calculation.
- `src/features/projects/jk-persistence.ts`: shared server-only validation and cabinet persistence within the caller's transaction. Rechecks J&K room ownership, fetches catalog prices server-side, validates custom items, replaces ordered price snapshots, locks configured room costs, and writes the calculated total to room financials.
- `src/features/projects/rooms-actions.ts`: validates admin-only `jk_configuration` payloads and saves cabinets in the same transaction as room creation/update. Invalid or unavailable catalog entries roll back the complete room save. Manual financial updates are skipped when a validated configuration supplies the total.
- `src/features/projects/jk-actions.ts`: standalone saves use the shared persistence service and revalidate Project View, Edit and list. Existing administrator-only catalog/load authorization remains enforced.
- `src/components/button-icon.tsx` and `src/app/globals.css`: cabinet icon and nested-modal/button styling based on `J&K Configurer Button.png`.
- `tests/jk-pricing.test.mjs`: regression coverage for 20% discounts, unit-cent rounding, quantities, empty configurations and $20 assembly charges.
- Validation: lint, TypeScript, all 9 unit tests and production build passed (placeholder environment; expected auth warnings without a live database). Chromium fixture workflow passed for immediate manufacturer/button visibility, nested modal, catalog/custom items, hinges, quantities, assembly, draft total, cancellation, preserved room fields, combined room-save payload and non-admin exclusion. PGlite execution of the actual server actions passed for atomic creation, server catalog prices, custom cabinets, snapshot persistence, locked-room reconfiguration, rollback, manufacturer validation and admin authorization. Live catalog contents were not inspected. No new migration; uses existing 0011 J&K tables and 0013 financial tables.

## Settings Import: J&K 2026 price list — 2026-10-20

- `src/app/(crm)/settings/page.tsx`: administrator-only Settings navigation now has Dropdown Options and Import. `/settings?tab=import` opens J&K Price List; Dropdown Options remains `/settings`.
- `src/features/settings/jk-price-importer.tsx`: screenshot-derived Import J&K Price List heading, blue Required CSV Headers panel, replacement notice and dashed click/drag-and-drop area with upload icon and “CSV files only, max 5MB”. Shows validation errors, selected filename, item/series counts, first-ten-row preview, Remove File, explicit Import button, pending and success states. Preview columns are Series, Item Code, Tier, Price, Category. All actionable buttons contain icons.
- `src/features/settings/jk-price-csv.ts`: shared client/server parser requires `series,item_code,tier,price_usd,category`, maps by header regardless of order, ignores the supplied SKU/dimensions/source-page columns, supports UTF-8 BOM and quoted CSV, validates exact currency/field lengths, rejects malformed/missing/duplicate fields and duplicate case-insensitive series/item-code/tier combinations. Limits: 5 MiB per file, 20,000 catalog rows.
- `src/features/settings/jk-import-actions.ts`: reauthorizes administrator access and revalidates file/CSV on the server before opening the import transaction. Returns actionable validation/result messages.
- `src/features/settings/jk-price-import.ts`: serialized transactional replacement of the active catalog. Upserts by case-insensitive series/item-code/tier, retains matching UUIDs, retires absent records and never modifies saved cabinet price snapshots. Failure rolls back the entire catalog update.
- `src/db/migrations/0015_jk_price_import.sql`: additive series/item_code/tier/category fields on `jk_price_items`, composite variant uniqueness, and partial active-series index. `price_usd` maps to the existing numeric `price` column. Existing legacy catalog rows remain valid.
- `src/features/projects/jk-data.ts`: catalog reads expose the new variant fields. Imported display labels include series, code and tier, allowing the existing cabinet search/selection and saved cabinet snapshots to distinguish variants; category supplies the catalog description.
- `next.config.ts`: server-action body limit is 6 MiB to permit a 5 MiB CSV plus multipart overhead; client/server file validation still caps CSVs at 5 MiB.
- `src/components/button-icon.tsx` / `src/app/globals.css`: reusable upload icon and responsive importer/tabs/preview styles based on `J&K Importer.png`.
- `tests/jk-price-csv.test.mjs`: five regression tests cover header mapping/extras, quoted CSV, currency, duplicate variant keys, malformed/empty data, and case handling.
- Validation: all 6,426 supplied entries across 18 series parse successfully. Fourteen unit tests, lint, TypeScript and production build pass (placeholder environment; expected warnings from unavailable live auth DB). Chromium fixture checks pass for click/native picker, supplied-file preview, explicit import, errors/success, drag/drop, removing/reselecting, bad headers and mobile layout. PGlite executed actual import actions against the complete supplied file, verified repeat import/stable IDs, updates, inactive replacement, unchanged historical snapshots, failure rollback, size limit and non-admin rejection. No live catalog was changed and the supplied price CSV was not committed.
- Deployment: run `npm run db:migrate` to apply migration 0015 before starting this version. Then import the supplied CSV through Settings → Import → Import J&K Price List.


## J&K import capitalization — 2026-10-20

- `src/features/settings/jk-price-csv.ts`: normalizes Series and Item Code to uppercase before field validation, duplicate detection and display-label generation. Shared parsing applies this to both the upload preview and server-side import; Tier, Price and Category retain their prior treatment.
- `tests/jk-price-csv.test.mjs`: updated normalized expectations and regression coverage for `a7` → `A7` and `#gs18` → `#GS18`.
- No new migration is needed for this change. The importer still requires migration 0015 from the preceding feature.
- Validation: lint, TypeScript and all 15 unit tests pass.

## J&K configurator series search and custom descriptions — 2026-10-21

- `src/features/projects/jk-catalog-search.tsx`: Series dropdown precedes item-code search, which stays disabled until a series is selected. Debounced searches discard stale responses. Fixed-position autocomplete overlays modal content, supports keyboard selection and outside dismissal, and displays item code/description on the left with one catalog price on the right.
- `src/features/projects/jk-data.ts` / `jk-actions.ts`: administrator-only active series options and server-side series-scoped, case-insensitive item-code search with escaped wildcard input.
- `src/features/projects/jk-configurator.tsx` / `src/app/globals.css`: custom entries contain Item Name, Description, Price and Add Item; description is preserved in configuration. Selected cabinet table remains unchanged. Responsive series/search and overlay styling.
- Validation: lint, TypeScript, all 15 unit tests and production build passed (placeholder database environment with expected auth connectivity warnings). Chromium fixture verified initial disabled search, selected-series request, unchanged modal dimensions, code/single-price layout, custom description persistence and existing room/configuration workflow. PGlite verified actual series/search queries, inactive exclusion, case handling, literal wildcard escaping and administrator authorization. No migration required.

## Instant cabinet search, manual J&K discount and draft accessories — 2026-10-20

- `jk-catalog-search.tsx`, `jk-actions.ts`, `jk-data.ts`: preload active administrator-only catalog once per configurator; item-code filtering is synchronous in the browser and scoped to selected Series. No per-keystroke server round trip or debounce.
- `jk-model.ts`, `jk-configurator.tsx`, `jk-persistence.ts`: remove fixed 20% cabinet discount from display, drafts and persisted totals. Configuration supplies full cabinet prices plus assembly; manufacturer discount is entered separately on the room. Existing saved configurations retain their snapshots until reapplied.
- `project-rooms.tsx`, `rooms-actions.ts`, `financial-actions.ts`: Mfr Discount % remains editable for configured J&K rooms while cabinet-derived Room Cost remains protected. Room saves persist the submitted discount independently of cabinet configuration.
- Room modal always displays Rev-A-Shelf count and borderless + Add Item. Entry fields appear only after clicking Add Item. Draft additions/removals save atomically with a new or existing room; Cancel discards them. Server validates names, codes, links and item limits. New-project room heading uses matching cabinet icon.
- Validation: lint, TypeScript and 15 unit tests passed. Chromium fixture verified Series/local search, stable overlay dimensions, manual discount, hidden initial accessory fields and new-room accessory payload. PGlite executed actual server actions verifying full-price cabinet totals, manual discount changes on locked rooms, accessory creation and replacement, rollback and authorization. No migration required.

## Shared site font family — 2026-10-21

- `src/app/globals.css`: centralizes the existing Project View/Edit system font stack in `--font-family` and applies inherited font family to all elements, pseudo-elements and native file-upload buttons. Native buttons, inputs, selects, textareas and code text now use the same family across authentication, dashboard, contacts, projects, invoices, Settings and user management. Existing font sizes, weights and layout remain intact.
- Validation: audited all source font declarations (one global stylesheet, no component/inline font-family overrides), lint and whitespace checks passed. Browser fixture could not run because the local Chromium runtime failed to launch. No migration required.

## Proposals and Door Orders navigation — 2026-10-22

- `src/components/app-shell.tsx`: adds Proposals then Door Orders directly below Invoices in desktop/mobile navigation with matching outline icons and existing active-page behavior. Uses the same read access as Invoices.
- `/proposals` and `/door-orders`: placeholder destinations matching the existing Invoices page, ready for future features.
- Validation: lint, TypeScript and whitespace checks passed. No migration required.

## Settings navigation gear icon — 2026-10-22

- `src/components/app-shell.tsx`: replaces the Settings radial icon with an outlined cog/gear in desktop and mobile menus, matching existing navigation stroke styling.
- Validation: lint and whitespace checks passed.

## Files navigation — 2026-10-22

- `src/components/app-shell.tsx`: adds Files directly below Door Orders in desktop/mobile menus with an outline folder icon, active-page behavior and the same read visibility as Projects.
- `/files`: placeholder destination for future file management.
- Validation: lint, TypeScript and whitespace checks passed. No migration required.

## Enable or disable project rooms — 2026-10-22

- Migration `0016_room_enabled.sql`: adds persisted room `enabled` flag defaulting to true for existing and new rooms.
- `project-rooms.tsx`, `rooms-actions.ts`: checkbox in each editable room's Actions cell saves independently without opening the room. Shows pending/error states and a Disabled label; preserves room data, cabinet configuration and accessories. Server checks projects:write, validates input and project ownership, and refreshes Edit, View and list routes.
- `rooms-data.ts`, `financial-data.ts`, `project-financial-panel.tsx`, `list-data.ts`: expose enabled state and exclude disabled rooms from Room Costs, Total, Total Cost and Profit in both project summaries and the project list. Re-enabling restores the room's discounted contribution.
- Validation: lint, TypeScript, 15 unit tests and whitespace checks passed. PGlite executed migration and actual server action, checked disable/re-enable financial contribution, ownership and staff authorization. Existing cabinet/room transaction regression checks passed.
- Deployment: run `npm run db:migrate` before starting this version.

## Room action checkbox alignment — 2026-10-22

- `src/app/globals.css`: centers items vertically in the room Actions flex row so enable checkboxes align with edit/delete controls.
- Validation: inspected the scoped rule and whitespace checks passed.

## Disabled room appearance on Project View — 2026-10-22

- `project-rooms.tsx`, `globals.css`: Project View removes the Disabled label and applies 40% opacity to the entire disabled room row, including manufacturer background and all contents. Project Edit retains its checkbox controls; both view and edit lists omit the Disabled label and fade the entire disabled row to 40% opacity.
- Validation: inspected view/edit conditions and whitespace checks passed.

## Rooms PDF download — 2026-10-22

- Project View: top-right Rooms Download button with download icon, busy state and inline retry error. Downloads a PDF directly; no print dialog.
- `/api/projects/[id]/rooms/pdf` (`src/app/api/projects/[id]/rooms/pdf/route.ts`): Node route with active-user and projects:read checks, UUID/existing-project validation, private/no-store caching and attachment headers.
- `src/features/projects/reports/rooms-table.ts`: reusable PDF table section accepting only nonfinancial room fields; omits disabled rooms and preserves enabled rooms in saved order; the PDF room count includes only enabled rooms, wraps text, repeats table headers across pages and handles zero rooms. Reuse `drawRoomsTable` in the future full-project report.
- `src/features/projects/reports/rooms-pdf.ts`: Letter PDF wrapper with project title, Door Styles and Finishes heading, date, room count and page footer; safe dated filename. Columns: Room, Door Style, Drawer Style, Species, Finish, Construction, Manufacturer. No prices, discounts, J&K configuration or J&K order list. No financial queries.
- `src/components/button-icon.tsx`: shared download icon. `next.config.ts`: PDFKit remains server-external with its standard font metrics included in traced deployments.
- Index review: existing `project_rooms(project_id, sort_order, id)` index serves this report's ordered lookup; no schema migration or additional database index needed.
- Validation: lint, TypeScript and 15 existing tests passed; production build completed with placeholder database configuration (no live database/auth session available). Visually reviewed PDF output and checked empty, single-page and multi-page reports, repeated headers and footers.

## J&K cabinet PDF download — 2026-10-22

- Project View: Download J&K Cabinets with download icon appears immediately left of Edit Project only when an enabled J&K room contains cabinet items. Available to project readers, with busy and error states.
- `/api/projects/[id]/jk-cabinets/pdf`: authenticated projects:read route; validates the project, excludes disabled/non-J&K rooms, returns 404 when no items remain, and sends a private, no-store PDF attachment.
- `reports/jk-cabinet-data.ts`: nonfinancial project-wide cabinet query ordered by room and item saved order. Existing project_rooms_project_order_idx and jk_room_cabinet_items_order_idx cover the joins/order; no migration required.
- `reports/jk-cabinet-table.ts`: reusable table with Room, Series, Item, Hinge, Description, Qty; groups rows by room, repeats headers and splits long descriptions across pages. Saved labels supply series/item where available; catalog metadata provides fallback; custom items retain their names.
- `reports/jk-cabinet-pdf.ts`: renders original path/polygon geometry from public/images/acc-logo.svg, J&K Cabinet List title, project name, Eastern generated date and page numbers. Logo/font assets included in route tracing. No prices or financial fields.
- Validation: lint, TypeScript and 15 existing tests passed; webpack production build checked with placeholder database configuration. Rendered sample PDFs to inspect logo, columns, room grouping and repeated headers. Live authenticated download requires the deployed database/session.

- Disabled-room display correction: shared room list now applies whole-row 40% opacity in both view/edit modes and removes the visible Disabled label and its unused CSS. Checkbox remains available to re-enable rooms.

## J&K configuration scrolling

- `jk-configurator.tsx`, `globals.css`: cabinet list uses a fixed 320px height capped at 40% of the viewport, independent scrolling and sticky column headers. Modal uses a bounded flex layout with totals and Cancel/Apply Configuration in a non-scrolling footer; shorter screens can scroll search/custom controls while save controls remain visible.

## Project button icon spacing

- Project View and Edit share the `crm-project-page` scope. Icon-bearing buttons/links use an 8px gap and reset legacy icon margins, covering leading/trailing icons and nested dialogs. Contact result rows retain their layout with an 8px icon margin.

## Full Project Report PDF — 2026-10-23

- `project-download-button.tsx`: Download PDF action immediately left of Edit on Project View; icon/text spacing, busy and retry error states follow existing buttons.
- `/api/projects/[id]/report/pdf`: authenticated projects:read endpoint with UUID/existing-project validation and private/no-store attachment response. Financial data is queried and included only for administrators, matching Project View.
- `reports/project-pdf.ts`: project title/status, two-column details/contact, 50/50 financial summary (six metrics on left, Total Cost on right), margin, paginated notes, and shared `drawRoomsTable` with repeated headers. Disabled rooms omitted; no room prices or J&K items. Uses existing financial calculation including freight/doors-pulls in totals.
- Filename: `<Project-Name>-Project-Report-YYYY-MM-DD.pdf`, using Eastern date. PDFKit font tracing included in next.config.ts.
- Index review: existing project PK, financial project lookup and ordered room indexes support this report; no schema changes needed.
- Validation: lint, TypeScript, 15 unit tests and webpack production build passed (placeholder DB; live authentication unverified). PDF checks covered repeated room headers, disabled-room exclusion, empty rooms, long notes and Eastern filenames; six mocked route checks verified authentication, permissions, missing/invalid projects and admin-only financial loading.

## Project Report refinements — 2026-10-23

- `reports/project-pdf.ts`: adds a subtle centered vector watermark from `public/images/acc-logo.svg` to every report page. Removes Current Status, Next Step and Sample Signoff Status from Project Details; retains status under the project title.
- `next.config.ts`: includes the SVG in Project Report route deployment tracing. No database/index changes required.
- Validation: TypeScript, scoped lint and PDF visual checks passed; watermark presence verified on every page of regular, long-notes and nonfinancial reports.

## Project Report Rev-A-Shelf Items — 2026-10-23

- `reports/rev-a-shelf-table.ts`: reusable nonfinancial table below Rooms, titled Rev-A-Shelf Items with Room, Item Name, Code, Link. Matches Rooms colors/striping, wraps long values, repeats section/table headers across pages, and makes HTTP(S) links clickable. Shows an empty state when no items exist.
- `reports/project-pdf.ts`: appends accessories from enabled rooms in saved room/item order; existing watermark/footer covers the added pages.
- Uses `listProjectRooms`' existing `ras_items` data; no additional queries or migrations. Existing `rev_a_shelf_items_room_order_idx(room_id,sort_order,id)` supports retrieval.
- Validation: lint, TypeScript and 15 existing tests passed. Generated PDFs verified item ordering/counts, disabled exclusion, clickable links, empty state and repeated headers; visually reviewed the Rooms-to-accessories transition and continuation page.

## Project Record Info — 2026-10-23

- `project-record-info.tsx`: bottom-left half-width card on Project View and Edit; Created/Updated dates display in Eastern time. Edit inputs participate in Save Changes; only deliberately changed dates are submitted as import overrides. Mobile uses full width.
- `data.ts`: exposes existing persisted created_at/updated_at as UTC ISO strings. `record-info-validation.ts` validates optional calendar-date overrides; `actions.ts` applies them last in the project save transaction. Unchanged Created is retained; normal saves stamp Updated with now().
- Migration `0017_project_record_updates.sql`: child-table triggers refresh project Updated after room, order/enabled, accessory, J&K, finance and checklist changes, including deletes. No existing timestamps are rewritten. Existing project PK and active date indexes suffice; no new indexes needed.
- Child actions revalidate View/Edit/list so Record Info stays current. Apply migration with `npm run db:migrate` before use.
- Validation: lint, TypeScript, 17 unit tests and production build passed (placeholder database). PGlite exercised all seven child trigger tables, historical date overrides and subsequent automatic updates; live database migration/UI review remains pending.

## Project Report record dates — 2026-10-23

- `reports/project-pdf.ts`: first-page top-right header displays Generated, Created and Updated. Saved project dates (including manual imports) use Eastern calendar dates, matching Record Info. Title/status reserve a separate left column to prevent overlap. No query or database index changes needed.
- Validation: TypeScript, scoped lint and PDF visual checks passed; imported historical dates confirmed in the header.

## Record Info and report style refinements — 2026-10-23

- `globals.css`: Record Info title matches Rooms at 14px/600; read-only dates use 13px muted gray.
- `reports/project-pdf.ts`, `next.config.ts`: removed Project Report watermark and its SVG dependency/tracing. J&K report logo retained.
- `reports/rev-a-shelf-table.ts`: light gray header with dark gray text distinguishes accessories from the dark Rooms header, including continuation pages. No database/index changes needed.
- Validation: TypeScript, scoped lint, whitespace checks and PDF visual review passed; watermark absence verified across all generated report pages.

## Authentication origin handling (2026-10-27)

Runtime Better Auth now derives its origin from `BETTER_AUTH_URL` (when set) or validated `APP_URL` and trusts only that exact origin. Keep `BETTER_AUTH_URL` / `APP_URL` aligned with the hostname, scheme, and port users actually visit, in both development and production. Cross-site navigation login protection remains enabled. A browser or extension that sends cross-site navigation metadata to the authentication endpoint may still be blocked; investigate request headers rather than disabling CSRF checks. The login UI displays a targeted message for `CROSS_SITE_NAVIGATION_LOGIN_BLOCKED`. No UI layout, routes, or database migrations changed. Local runtime verification remains pending.

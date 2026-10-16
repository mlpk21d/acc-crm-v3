# PostgreSQL

## Migration contract

Migrations are ordered `NNNN_description.sql` scripts in `src/db/migrations/`.
Once applied, do not modify a migration. Add a new numbered migration instead.
The runner records SHA-256 checksums in `public.schema_migrations`, uses a PostgreSQL
advisory lock, and executes each migration transactionally.

To initialize a local development database, first create the role and database
using your local PostgreSQL administrator account, then set `DATABASE_URL` in
`.env.local`. Never commit credentials.

```bash
npm install
npm run db:migrate
```

Afterward, `GET /api/health/database` should report reachable when the configured
database is available.

## Design decisions

- `crm_users` represents CRM user details/roles only. Authentication credentials
  and sessions will be defined by the selected authentication library later.
- `contacts` has UUID IDs, searchable names/company, creator/updater references,
  UTC-safe timestamps, soft deletes, and partial indexes.
- Do not add invoice/project foreign keys until the V3 specification's exact
  relationships and legacy migrations have been reconciled.
- The initial schema is a provisional technical foundation, not a complete
  replacement for the existing ACC CRM field definitions.

## Safety

Use a dedicated development database. No automatic reset/drop/seed on application
startup. Never run first-time migrations against a production database without
a backup and reviewed migration plan.

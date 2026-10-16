# Authentication deployment

## Model

Better Auth manages passwords, sessions, and verification in PostgreSQL. The admin
plugin supports first-account provisioning; CRM permissions remain in
`public.crm_users`. Each protected request must resolve a live, active CRM user
by `auth_user_id`. All future APIs and server actions must also enforce permissions.

Public registration is disabled. Do not expose database or authentication secrets
in client-side environment variables.

## One-time development initialization

1. Pull `main`, run `npm install`, and configure `.env.local` with
   `DATABASE_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET`. Generate the
   secret using `openssl rand -base64 32`.
2. From a trusted local terminal, run `npm run auth:schema`. This writes
   `src/db/migrations/0002_better_auth.sql`. **Review the generated SQL carefully**
   and commit it before applying `npm run db:migrate`. Do not modify applied
   migration 0001. Never overwrite migration 0002 after it has been applied.
   Better Auth may evolve its own schema across package versions.
3. Run `npm run auth:admin -- --email admin@example.com --name "Administrator" --role admin`
   after schema installation. Follow the command's secure password prompt.
   Never paste passwords into shell commands, source files, or SQL scripts.
4. Link that verified auth account to the CRM profile, using the exact same email:
   `ADMIN_EMAIL=admin@example.com npm run auth:link-admin`.
5. Run `npm run check`, `npm run build`, start locally and confirm that
   an anonymous request to `/` redirects to `/login`, valid admin credentials
   permit access, and a disabled CRM profile is rejected.

Authentication schema generation and user provisioning are **not yet run** by
the GitHub-connected development session.

## Security checklist

- Keep the PostgreSQL role limited to the `acc_crm` database, not superuser.
- Never enable public sign-up as a shortcut to bootstrap.
- Verify permissions in route handlers/server actions; layout checks alone
  are insufficient.
- Avoid leaking whether a particular email is registered.
- Implement logout, session revocation, rate-limiting policy, tests, and
  first-user recovery procedures before production deployment.

## CLI dependency

The deprecated `@better-auth/cli` package was replaced by the `auth` CLI.
The `auth` executable is provided by the installed `auth` devDependency.
The `auth` CLI and `better-auth` runtime versions are pinned together to
avoid drift. Re-run `npm install` after pulling the updated package.json.

## CLI and server-only imports

Use `scripts/auth/cli-config.ts` for schema generation rather than
`src/lib/auth.ts`. The runtime auth module and database client retain their
`server-only` guards. The CLI uses shared `src/lib/auth-options.ts` so plugin
and password settings remain aligned. `npm run auth:schema` reads `.env.local`
with Node 24 before invoking the CLI. Do not remove `server-only` imports.

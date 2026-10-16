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
2. From a trusted local terminal, generate the Better Auth SQL with
   `npm run auth:schema`. **Review the generated SQL carefully** and preserve
   it under version control as a new numbered `src/db/migrations/` file before
   applying via `npm run db:migrate`. Do not modify applied migration 0001.
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

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
   `ADMIN_EMAIL=admin@example.com npm run auth:link-admin`. Existing CRM profiles that
   are inactive, deleted, already linked elsewhere, or not admins will be rejected
   instead of silently reactivated or promoted.
5. Run `npm run check`, `npm run build`, start locally and confirm that
   an anonymous request to `/` redirects to `/login`, valid admin credentials
   permit access, and a disabled CRM profile is rejected.

Authentication schema generation and user provisioning are **not yet run** by
the GitHub-connected development session.

## Preferred one-time .env.local bootstrap

Configure these values in `.env.local` (never commit this file):

```dotenv
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=use-a-long-random-private-password
INITIAL_ADMIN_NAME=Administrator
```

The minimum password length is **8 characters** for both Better Auth and the bootstrap script. Use a longer, unique password for any real deployment.

Then run `npm run auth:bootstrap-admin`. This command refuses to operate if
either Better Auth users or CRM users already exist. It creates the
Better Auth administrator through the supported CLI, verifies the account,
and links it into `crm_users`. There is no automatic admin creation when
the web server starts.

**Security limitation:** The Better Auth CLI accepts unattended passwords
as an argument, meaning the password can briefly appear in local process
argument listings. Run only on a trusted local machine; secure `.env.local`
(permission `chmod 600 .env.local`) and delete the
`INITIAL_ADMIN_PASSWORD` line after a successful bootstrap. Do not store
the actual password in Git. For higher-security environments, use the
interactive `npm run auth:admin` workflow and then `auth:link-admin`.

If Better Auth account creation succeeds but CRM linkage fails, do not rerun
the bootstrap or reset records blindly. Inspect the existing records and use
the separate `auth:link-admin` recovery command only after verifying the
authentication account and expected authorization.

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

## Local development CSRF policy

Runtime Better Auth leaves CSRF protection enabled except when **all** of these
conditions are true:

- Next.js runs with `NODE_ENV=development` (normally `npm run dev`).
- Both `APP_URL` and `BETTER_AUTH_URL` (or its APP_URL fallback) use `http:`.
- Both URLs have the **same origin** (scheme, hostname, and port).
- The hostname is exactly `localhost`, `127.0.0.1`, or IPv6 loopback `[::1]`.

The decision is in `src/lib/auth-security.ts` and covered by
`tests/auth-security.test.mjs`. The runtime uses the Better Auth
`advanced.disableCSRFCheck` option; the separate trusted-origin check
remains enabled. Production processes never disable CSRF checks, even if
configured for a loopback URL. Do **not** run the development server on a
public network when using this exception.

For local setup, use the **same** URL for both variables, e.g.:

```dotenv
APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
```

Restart the development server after modifying environment configuration.
Use `npm run check` to run the security policy tests with the rest of the
validation suite. This exception is a local-development workaround and does
not establish the root cause of any observed cross-site navigation error.

## Recover an existing local administrator password

Use the interactive local recovery command rather than rerunning
`auth:bootstrap-admin` or creating a second account:

```bash
npm run auth:reset-password
```

It prompts for the existing administrator email and new password twice without
echoing password input. The operator must confirm the exact email. This command
requires an interactive terminal, matching loopback HTTP `APP_URL` and
`BETTER_AUTH_URL`, a local PostgreSQL connection, and a process not running
with `NODE_ENV=production`. It refuses missing, inactive, banned, unlinked, or
non-administrator accounts and refuses missing or ambiguous existing credential
rows. The replacement password is hashed with Better Auth's exported
`hashPassword` implementation, then only the existing credential row is
updated and that administrator's sessions are revoked in one transaction.
The command does not delete CRM business data, migrate the schema, or reset
other users.

Never put the password on a command line or commit it in environment files.
Run the script only on your trusted local development machine. There is no
production password recovery bypass in this command; configure a secure,
verified reset-email workflow for production use.

A previously observed `CROSS_SITE_NAVIGATION_LOGIN_BLOCKED` response happens
before checking the password and **will not** be resolved merely by a
credential reset. Investigate the exact failed request's headers and runtime
logging if it persists.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD;
const name = process.env.INITIAL_ADMIN_NAME?.trim() || "Administrator";

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("INITIAL_ADMIN_EMAIL must be a valid email address.");
  process.exit(1);
}
if (!password || password.length < 12 || password.trim() !== password) {
  console.error("INITIAL_ADMIN_PASSWORD must be at least 12 characters without leading/trailing whitespace.");
  process.exit(1);
}
if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
  console.error("DATABASE_URL and BETTER_AUTH_SECRET are required.");
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
let cliSucceeded = false;
try {
  await client.connect();

  // Only bootstrap an entirely unused user store. This command must never
  // promote existing users or replace credentials.
  const counts = await client.query(
    `SELECT (SELECT count(*)::integer FROM public."user") AS auth_users,
            (SELECT count(*)::integer FROM public.crm_users) AS crm_users`,
  );
  if (counts.rows[0].auth_users !== 0 || counts.rows[0].crm_users !== 0) {
    throw new Error("Bootstrap refused: users already exist. Use the regular user-management flow.");
  }

  const executable = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "auth.cmd" : "auth");
  if (!existsSync(executable)) throw new Error("Better Auth CLI not installed. Run npm install first.");

  // CLI requires a password argument for unattended provisioning; on systems
  // where local process arguments are readable, this briefly exposes the
  // password to other local users. Run on a trusted machine only.
  const command = spawnSync(executable, [
    "create-admin",
    "--config", "scripts/auth/cli-config.ts",
    "--email", email,
    "--name", name,
    "--password", password,
    "--role", "admin",
    "--yes",
  ], { cwd: root, env: process.env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

  if (command.error || command.status !== 0) {
    throw new Error("Better Auth administrator creation failed. Check configuration and database connectivity.");
  }
  cliSucceeded = true;

  await client.query("BEGIN");
  try {
    const result = await client.query(
      `SELECT id, name, email, "emailVerified", role
       FROM public."user" WHERE lower(email) = $1 FOR UPDATE`,
      [email],
    );
    if (result.rowCount !== 1 || result.rows[0].emailVerified !== true || result.rows[0].role !== "admin") {
      throw new Error("Created auth account is not a verified administrator.");
    }
    const user = result.rows[0];
    await client.query(
      `INSERT INTO public.crm_users (auth_user_id, display_name, email, role, is_active)
       VALUES ($1, $2, $3, 'admin', true)`,
      [user.id, user.name, user.email],
    );
    await client.query("COMMIT");
    console.log("Initial administrator created and linked to an active CRM profile.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
} catch (error) {
  console.error("Bootstrap failed:", error instanceof Error ? error.message : "Unknown failure");
  if (cliSucceeded) {
    console.error("An authentication account may exist without a CRM profile. Do not rerun or delete records blindly; use the documented recovery procedure.");
  }
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

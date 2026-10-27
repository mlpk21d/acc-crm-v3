import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import process from "node:process";

import { hashPassword, verifyPassword } from "better-auth/crypto";
import { Client } from "pg";

const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

function requireLocalEnvironment() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Password recovery is disabled in production.");
  }
  const appUrl = new URL(process.env.APP_URL ?? "http://localhost:3000");
  const authUrl = new URL(process.env.BETTER_AUTH_URL || appUrl.href);
  const databaseUrl = new URL(process.env.DATABASE_URL ?? "");

  if (
    appUrl.protocol !== "http:" ||
    authUrl.protocol !== "http:" ||
    appUrl.origin !== authUrl.origin ||
    !loopbackHosts.has(appUrl.hostname) ||
    !["postgres:", "postgresql:"].includes(databaseUrl.protocol) ||
    !loopbackHosts.has(databaseUrl.hostname)
  ) {
    throw new Error(
      "Password recovery requires matching local HTTP app/auth URLs and a loopback PostgreSQL connection.",
    );
  }
  return process.env.DATABASE_URL;
}

function openPrompt() {
  // Readline controls terminal echo. Suppress its output while entering passwords.
  let hidden = false;
  const output = new Writable({
    write(chunk, _encoding, callback) {
      if (!hidden) process.stdout.write(chunk);
      callback();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  return {
    question: (prompt) => rl.question(prompt),
    async password(prompt) {
      process.stdout.write(prompt);
      hidden = true;
      try {
        return await rl.question("");
      } finally {
        hidden = false;
        process.stdout.write("\n");
      }
    },
    close: () => rl.close(),
  };
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Run from a local interactive terminal; passwords are never accepted as arguments.");
  }
  const databaseUrl = requireLocalEnvironment();
  const prompt = openPrompt();
  let email;
  let newPassword;
  try {
    email = (await prompt.question("Existing administrator email: ")).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid administrator email.");
    }

    newPassword = await prompt.password("New password (input hidden): ");
    const confirmation = await prompt.password("Confirm new password (input hidden): ");
    if (newPassword.length < 8 || newPassword.length > 128) {
      throw new Error("Password must be between 8 and 128 characters.");
    }
    if (newPassword !== confirmation) throw new Error("Passwords do not match.");
    if ((await prompt.question(`Type RESET ${email} to confirm: `)) !== `RESET ${email}`) {
      throw new Error("Reset cancelled.");
    }
  } finally {
    prompt.close();
  }

  const client = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    await client.query("BEGIN");
    const accountOwner = await client.query(
      `SELECT u.id, u.role AS auth_role, u.banned,
              c.id AS crm_id, c.role AS crm_role, c.is_active, c.deleted_at
       FROM public."user" AS u
       JOIN public.crm_users AS c ON c.auth_user_id = u.id
       WHERE lower(u.email) = $1
       FOR UPDATE OF u, c`,
      [email],
    );

    const owner = accountOwner.rows[0];
    if (
      accountOwner.rowCount !== 1 ||
      owner.auth_role !== "admin" ||
      owner.crm_role !== "admin" ||
      owner.banned === true ||
      owner.is_active !== true ||
      owner.deleted_at !== null
    ) {
      throw new Error("An active, linked administrator account with that email was not found.");
    }

    const credential = await client.query(
      `SELECT id FROM public."account"
       WHERE "userId" = $1 AND "providerId" = 'credential' AND "accountId" = $1
       FOR UPDATE`,
      [owner.id],
    );
    if (credential.rowCount !== 1) {
      throw new Error("Expected exactly one existing password credential; nothing was changed.");
    }

    // Better Auth's own scrypt hashing format; never write plaintext passwords.
    const hashedPassword = await hashPassword(newPassword);
    // Fail before touching PostgreSQL if this runtime cannot verify its own hash.
    if (!(await verifyPassword({ hash: hashedPassword, password: newPassword }))) {
      throw new Error("Password hashing self-check failed; nothing was changed.");
    }
    const update = await client.query(
      `UPDATE public."account"
       SET "password" = $1, "updatedAt" = now()
       WHERE id = $2`,
      [hashedPassword, credential.rows[0].id],
    );
    if (update.rowCount !== 1) {
      throw new Error("Password credential update did not affect exactly one row.");
    }
    // Read the saved value back and verify it BEFORE committing.
    // A mismatch rolls back the password update and preserves prior sessions.
    const saved = await client.query(
      `SELECT "password" FROM public."account" WHERE id = $1`,
      [credential.rows[0].id],
    );
    if (
      saved.rowCount !== 1 ||
      typeof saved.rows[0].password !== "string" ||
      !(await verifyPassword({ hash: saved.rows[0].password, password: newPassword }))
    ) {
      throw new Error("Stored password verification failed; changes were rolled back.");
    }
    // Old browser sessions must not remain valid after administrator recovery.
    await client.query('DELETE FROM public."session" WHERE "userId" = $1', [owner.id]);
    await client.query("COMMIT");
    console.log("Administrator password updated and verified against its stored hash. Existing sessions have been revoked.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end().catch(() => {});
    newPassword = undefined;
  }
}

main().catch((error) => {
  console.error("Password recovery failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});

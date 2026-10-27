import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import process from "node:process";

import { verifyPassword } from "better-auth/crypto";
import { Client } from "pg";

const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

function localDatabaseConfig() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("This diagnostic is not available in production.");
  }

  const appUrl = new URL(process.env.APP_URL ?? "http://localhost:3000");
  const authUrl = new URL(process.env.BETTER_AUTH_URL || appUrl.href);
  const dbUrl = new URL(process.env.DATABASE_URL ?? "");

  if (
    appUrl.protocol !== "http:" ||
    authUrl.protocol !== "http:" ||
    appUrl.origin !== authUrl.origin ||
    !loopbackHosts.has(appUrl.hostname) ||
    !["postgres:", "postgresql:"].includes(dbUrl.protocol) ||
    !loopbackHosts.has(dbUrl.hostname)
  ) {
    throw new Error("Verification requires matching loopback app URLs and local PostgreSQL.");
  }

  return {
    connectionString: process.env.DATABASE_URL,
    // Safe identifiers to compare with the running Next.js application.
    dbLabel: `${dbUrl.hostname}:${dbUrl.port || "5432"}${dbUrl.pathname}`,
  };
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Run this read-only check in an interactive local terminal.");
  }

  const config = localDatabaseConfig();
  let hide = false;
  const output = new Writable({
    write(chunk, _encoding, callback) {
      if (!hide) process.stdout.write(chunk);
      callback();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  let email;
  let password;

  try {
    email = (await rl.question("Existing administrator email: ")).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }
    process.stdout.write("Password to verify (hidden): ");
    hide = true;
    try {
      password = await rl.question("");
    } finally {
      hide = false;
      process.stdout.write("\n");
    }
  } finally {
    rl.close();
  }

  const client = new Client({
    connectionString: config.connectionString,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    const result = await client.query(
      `SELECT a.password
       FROM public."user" AS u
       JOIN public."account" AS a ON a."userId" = u.id
       JOIN public.crm_users AS c ON c.auth_user_id = u.id
       WHERE lower(u.email) = $1
         AND u.role = 'admin'
         AND c.role = 'admin'
         AND c.is_active = true
         AND c.deleted_at IS NULL
         AND a."providerId" = 'credential'
         AND a."accountId" = u.id`,
      [email],
    );

    const hash = result.rowCount === 1 ? result.rows[0].password : null;
    let matches = false;

    if (typeof hash === "string" && hash.length > 0) {
      try {
        matches = await verifyPassword({ hash, password });
      } catch {
        matches = false;
      }
    }
    console.log(`Database used: ${config.dbLabel}`);
    console.log(`Existing administrator credential: ${hash ? "found" : "not found or ambiguous"}`);
    console.log(`Stored password matches entered password: ${matches ? "YES" : "NO"}`);
    if (!matches) process.exitCode = 1;
  } finally {
    password = undefined;
    await client.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error("Password verification failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});

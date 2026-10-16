import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const migrationsDir = path.join(root, "src/db/migrations");
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is required. Configure .env.local before migrating.");
  process.exit(1);
}

const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });

try {
  await client.connect();
  const filenames = (await readdir(migrationsDir))
    .filter((filename) => /^\d{4}_[a-z0-9_]+\.sql$/.test(filename))
    .sort();

  const seen = new Set();
  for (const filename of filenames) {
    const version = filename.slice(0, 4);
    if (seen.has(version)) throw new Error(`Duplicate migration number: ${version}`);
    seen.add(version);
  }

  // Serialize migration runners using a session-level advisory lock.
  await client.query("SELECT pg_advisory_lock(hashtext('acc-crm-v3-schema-migrations'))");
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS public.schema_migrations (
      version text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const lockedApplied = await client.query("SELECT version, checksum FROM public.schema_migrations");
    const lockedMap = new Map(lockedApplied.rows.map((row) => [row.version, row.checksum]));
    for (const filename of filenames) {
      const version = filename.slice(0, 4);
      const sql = await readFile(path.join(migrationsDir, filename), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const prior = lockedMap.get(version);
      if (prior) {
        if (prior !== checksum) throw new Error(`Migration ${filename} changed after application`);
        console.log(`skip ${filename}`);
        continue;
      }
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO public.schema_migrations (version, checksum) VALUES ($1, $2)", [version, checksum]);
        await client.query("COMMIT");
        console.log(`applied ${filename}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext('acc-crm-v3-schema-migrations'))");
  }
} catch (error) {
  console.error("Database migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

import process from "node:process";
import { Client } from "pg";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const databaseUrl = process.env.DATABASE_URL;

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Set ADMIN_EMAIL to the exact Better Auth administrator email.");
  process.exit(1);
}
if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 });
try {
  await client.connect();
  await client.query("BEGIN");
  try {
    // Lock the auth record to protect the one-time linkage from races.
    const account = await client.query(
      'SELECT id, name, email, "emailVerified", role FROM public."user" WHERE lower(email) = $1 FOR UPDATE',
      [email],
    );
    if (account.rowCount !== 1 || !account.rows[0].emailVerified || account.rows[0].role !== "admin") {
      throw new Error("Expected exactly one verified Better Auth administrator with this email.");
    }
    const authUser = account.rows[0];
    const existing = await client.query(
      "SELECT id, auth_user_id, role FROM public.crm_users WHERE lower(email) = $1 FOR UPDATE",
      [email],
    );
    if (existing.rowCount > 1) {
      throw new Error("Ambiguous CRM profile. Resolve duplicate email records manually.");
    }
    if (existing.rowCount === 1) {
      const profile = existing.rows[0];
      if (profile.auth_user_id && profile.auth_user_id !== authUser.id) {
        throw new Error("CRM profile is already linked to a different authentication account.");
      }
      await client.query(
        `UPDATE public.crm_users
         SET auth_user_id = $1, role = 'admin', is_active = true, deleted_at = NULL,
             updated_at = now()
         WHERE id = $2`,
        [authUser.id, profile.id],
      );
    } else {
      await client.query(
        `INSERT INTO public.crm_users (auth_user_id, display_name, email, role)
         VALUES ($1, $2, $3, 'admin')`,
        [authUser.id, authUser.name, authUser.email],
      );
    }
    await client.query("COMMIT");
    console.log("Verified administrator linked to an active CRM profile.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
} catch (error) {
  console.error("Administrator linkage failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

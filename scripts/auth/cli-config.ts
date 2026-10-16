// CLI-only Better Auth config: intentionally does not import Next.js server-only modules.
import { betterAuth } from "better-auth";
import { Pool } from "pg";

import { authOptions } from "../../src/lib/auth-options";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to generate the Better Auth schema.");
}

export const auth = betterAuth({
  database: new Pool({ connectionString: databaseUrl }),
  ...authOptions,
});

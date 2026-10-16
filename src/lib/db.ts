import "server-only";

import { Pool } from "pg";

import { getServerEnv } from "@/lib/env";

const globalForDb = globalThis as typeof globalThis & {
  accCrmPool?: Pool;
};

export function getDbPool(): Pool {
  if (!globalForDb.accCrmPool) {
    const { DATABASE_URL } = getServerEnv();

    globalForDb.accCrmPool = new Pool({
      connectionString: DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  return globalForDb.accCrmPool;
}

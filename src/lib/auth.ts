import "server-only";

import { betterAuth } from "better-auth";

import { authOptions } from "@/lib/auth-options";
import { getDbPool } from "@/lib/db";

export const auth = betterAuth({
  database: getDbPool(),
  ...authOptions,
});

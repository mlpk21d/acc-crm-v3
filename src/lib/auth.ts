import "server-only";

import { betterAuth } from "better-auth";

import { authOptions } from "@/lib/auth-options";
import { getDbPool } from "@/lib/db";
import { getServerEnv } from "@/lib/env";

const configuredUrl = process.env.BETTER_AUTH_URL || getServerEnv().APP_URL;
const appOrigin = new URL(configuredUrl).origin;

export const auth = betterAuth({
  database: getDbPool(),
  baseURL: appOrigin,
  trustedOrigins: [appOrigin],
  ...authOptions,
});

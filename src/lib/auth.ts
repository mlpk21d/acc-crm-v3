import "server-only";

import { betterAuth } from "better-auth";

import { authOptions } from "@/lib/auth-options";
import { shouldDisableCsrfCheck } from "@/lib/auth-security";
import { getDbPool } from "@/lib/db";
import { getServerEnv } from "@/lib/env";

const appUrl = getServerEnv().APP_URL;
const configuredUrl = process.env.BETTER_AUTH_URL || appUrl;
const appOrigin = new URL(configuredUrl).origin;
const disableCsrfCheck = shouldDisableCsrfCheck({
  nodeEnv: process.env.NODE_ENV,
  appUrl,
  authUrl: configuredUrl,
});

export const auth = betterAuth({
  database: getDbPool(),
  baseURL: appOrigin,
  trustedOrigins: [appOrigin],
  // This exception is limited to local Next.js development on loopback.
  // Origin validation is left on; production always retains CSRF checks.
  advanced: {
    disableCSRFCheck: disableCsrfCheck,
  },
  ...authOptions,
});

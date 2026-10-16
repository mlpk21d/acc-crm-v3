import "server-only";

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { getDbPool } from "@/lib/db";

export const auth = betterAuth({
  database: getDbPool(),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
  },
  plugins: [admin(), nextCookies()],
});

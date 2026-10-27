import { toNextJsHandler } from "better-auth/next-js";

import { getLoginRequestDiagnostic } from "@/lib/auth-diagnostics";
import { auth, disableCsrfCheck } from "@/lib/auth";
import { getServerEnv } from "@/lib/env";

const handlers = toNextJsHandler(auth);

export const GET = handlers.GET;

export async function POST(request: Request): Promise<Response> {
  const response = await handlers.POST(request);

  // Only log login request metadata in development. Never log passwords,
  // cookies, auth headers, request bodies, or response bodies.
  if (
    process.env.NODE_ENV === "development" &&
    new URL(request.url).pathname === "/api/auth/sign-in/email"
  ) {
    const diagnostic = await getLoginRequestDiagnostic(
      request,
      response,
      disableCsrfCheck,
    );
    // Database coordinates only (never the database username or password).
    // Compare this with the read-only local password verification command.
    const dbUrl = new URL(getServerEnv().DATABASE_URL);
    const runtimeDatabase = `${dbUrl.hostname}:${dbUrl.port || "5432"}${dbUrl.pathname}`;
    console.info(
      "[ACC CRM auth diagnostic]",
      JSON.stringify({ ...diagnostic, runtimeDatabase }),
    );
  }

  return response;
}

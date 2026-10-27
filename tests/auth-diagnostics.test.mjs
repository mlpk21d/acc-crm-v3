import assert from "node:assert/strict";
import test from "node:test";

import { getLoginRequestDiagnostic } from "../src/lib/auth-diagnostics.ts";

test("local CSRF diagnostics show request metadata without exposing credentials", async () => {
  const request = new Request("http://localhost:3000/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "content-type": "application/json",
      authorization: "Bearer secret-authorization",
      cookie: "session=secret-cookie",
    },
    body: JSON.stringify({ email: "private@example.com", password: "secret-password" }),
  });
  const response = new Response(
    JSON.stringify({
      code: "CROSS_SITE_NAVIGATION_LOGIN_BLOCKED",
      message: "Never log a private response body",
    }),
    { status: 403, headers: { "content-type": "application/json" } },
  );

  const diagnostic = await getLoginRequestDiagnostic(request, response, false);
  assert.deepEqual(diagnostic, {
    csrfCheckDisabled: false,
    requestMethod: "POST",
    secFetchSite: "same-origin",
    secFetchMode: "cors",
    secFetchDest: "empty",
    origin: "http://localhost:3000",
    originMatchesRequest: true,
    status: 403,
    errorCode: "CROSS_SITE_NAVIGATION_LOGIN_BLOCKED",
  });
  const logged = JSON.stringify(diagnostic);
  for (const sensitive of [
    "private@example.com",
    "secret-password",
    "secret-cookie",
    "secret-authorization",
    "Never log a private response body",
  ]) {
    assert.equal(logged.includes(sensitive), false);
  }
});

test("diagnostic does not affect non-JSON authentication responses", async () => {
  const request = new Request("http://localhost:3000/api/auth/sign-in/email", {
    method: "POST",
  });
  const response = new Response("Temporary error", { status: 500 });
  const diagnostic = await getLoginRequestDiagnostic(request, response, true);
  assert.equal(diagnostic.status, 500);
  assert.equal(diagnostic.errorCode, null);
  assert.equal(diagnostic.csrfCheckDisabled, true);
});

/**
 * Development-only metadata for diagnosing login CSRF errors.
 *
 * Deliberately excludes request bodies, credentials, cookies, authorization
 * headers, full referers, and response bodies. The caller must restrict
 * emission of this metadata to local development.
 */
export async function getLoginRequestDiagnostic(
  request: Request,
  response: Response,
  csrfCheckDisabled: boolean,
) {
  let errorCode: string | null = null;

  if (!response.ok) {
    try {
      const result: unknown = await response.clone().json();
      if (
        result !== null &&
        typeof result === "object" &&
        "code" in result &&
        typeof result.code === "string"
      ) {
        errorCode = result.code;
      }
    } catch {
      // A non-JSON response should not affect authentication.
    }
  }

  return {
    csrfCheckDisabled,
    requestMethod: request.method,
    secFetchSite: request.headers.get("sec-fetch-site"),
    secFetchMode: request.headers.get("sec-fetch-mode"),
    secFetchDest: request.headers.get("sec-fetch-dest"),
    origin: request.headers.get("origin"),
    originMatchesRequest: (() => {
      const raw = request.headers.get("origin");
      if (!raw) return null;
      try {
        return new URL(raw).origin === new URL(request.url).origin;
      } catch {
        return false;
      }
    })(),
    status: response.status,
    errorCode,
  };
}

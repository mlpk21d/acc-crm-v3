/**
 * CSRF checks may be disabled only for an explicitly local development server.
 * Never infer development solely from a loopback URL: production processes can
 * also sit behind a reverse proxy on localhost.
 */
export function shouldDisableCsrfCheck({
  nodeEnv,
  appUrl,
  authUrl,
}: {
  nodeEnv: string | undefined;
  appUrl: string;
  authUrl: string;
}): boolean {
  if (nodeEnv !== "development") return false;

  try {
    const app = new URL(appUrl);
    const auth = new URL(authUrl);
    const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

    return (
      app.protocol === "http:" &&
      auth.protocol === "http:" &&
      app.origin === auth.origin &&
      loopbackHosts.has(app.hostname)
    );
  } catch {
    return false;
  }
}

"use client";
import { ButtonIcon } from "@/components/button-icon";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
      });
      if (signInError) {
        if (signInError.code === "CROSS_SITE_NAVIGATION_LOGIN_BLOCKED") {
          setError("Your browser blocked sign-in for security reasons. Open this app directly at its configured URL and try again.");
        } else {
          setError("Invalid credentials or account unavailable.");
        }
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to sign in. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<ButtonIcon kind="login" /></button>
    </form>
  );
}

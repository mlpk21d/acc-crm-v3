"use client";

import { useState } from "react";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export function SignOutButton() {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error("Sign out failed");
      window.location.assign("/login");
    } catch {
      setBusy(false);
      window.alert("Unable to sign out. Please try again.");
    }
  }

  return (
    <button type="button" className="crm-sign-out" onClick={signOut} disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}

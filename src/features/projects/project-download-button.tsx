"use client";
import { useState } from "react";
import { ButtonIcon } from "@/components/button-icon";

export function ProjectDownloadButton({ projectId }: { projectId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/report/pdf`);
      if (!response.ok || !response.headers.get("Content-Type")?.includes("application/pdf")) throw new Error("Download failed");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "Project-Report.pdf";
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { setError("Unable to download project report. Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="crm-jk-download"><button type="button" className="crm-project-edit-link" onClick={download} disabled={busy} aria-busy={busy}>
    <ButtonIcon kind="download"/>{busy ? "Downloading…" : "Download PDF"}
  </button>{error && <p role="alert" className="contact-form-error">{error}</p>}</div>;
}

import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireCrmUser } from "@/features/auth/session";

export default async function CrmLayout({ children }: { children: ReactNode }) {
  const user = await requireCrmUser();
  return <AppShell user={user}>{children}</AppShell>;
}

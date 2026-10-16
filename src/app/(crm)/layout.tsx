import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireCrmUser } from "@/features/auth/session";

export default async function CrmLayout({ children }: { children: ReactNode }) {
  await requireCrmUser();
  return <AppShell>{children}</AppShell>;
}

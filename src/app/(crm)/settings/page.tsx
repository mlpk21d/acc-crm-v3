import { requirePermission } from "@/features/auth/session";

import { PagePlaceholder } from "@/components/page-placeholder";

export default async function SettingsPage() {
  await requirePermission("settings:manage");
  return (
    <PagePlaceholder
      title="Settings"
      description="Manage application and business settings."
    />
  );
}

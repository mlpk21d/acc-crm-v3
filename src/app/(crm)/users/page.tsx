import { requirePermission } from "@/features/auth/session";

import { PagePlaceholder } from "@/components/page-placeholder";

export default async function UsersPage() {
  await requirePermission("users:manage");
  return (
    <PagePlaceholder
      title="Users"
      description="Manage CRM users, access, and permissions."
    />
  );
}

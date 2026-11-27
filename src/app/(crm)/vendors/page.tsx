import { PagePlaceholder } from "@/components/page-placeholder";
import { requirePermission } from "@/features/auth/session";

export default async function VendorsPage() {
  await requirePermission("projects:read");
  return <PagePlaceholder title="Vendors" description="View and manage vendors."/>;
}

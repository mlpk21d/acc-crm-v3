import { ContactForm } from "@/features/contacts/contact-form";
import { getRegionOptions } from "@/features/contacts/data";
import { requirePermission } from "@/features/auth/session";

export default async function NewContactPage() {
  await requirePermission("contacts:write");
  const regions = await getRegionOptions();
  return <section><div className="page-heading"><h1>New contact</h1></div><ContactForm regions={regions} /></section>;
}

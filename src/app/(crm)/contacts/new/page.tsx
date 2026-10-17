import { ContactForm } from "@/features/contacts/contact-form";
import { getContactDropdownOptions } from "@/features/contacts/data";
import { requirePermission } from "@/features/auth/session";

export default async function NewContactPage() {
  await requirePermission("contacts:write");
  const options = await getContactDropdownOptions();
  return <section><div className="page-heading"><h1>New contact</h1></div><ContactForm options={options} /></section>;
}

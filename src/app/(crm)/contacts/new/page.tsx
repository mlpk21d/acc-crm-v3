import { ContactForm } from "@/features/contacts/contact-form";
import { requirePermission } from "@/features/auth/session";

export default async function NewContactPage() {
  await requirePermission("contacts:write");
  return <section><div className="page-heading"><h1>New contact</h1></div><ContactForm /></section>;
}

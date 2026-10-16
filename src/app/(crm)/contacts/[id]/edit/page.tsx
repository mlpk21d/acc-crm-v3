import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/session";
import { ContactForm } from "@/features/contacts/contact-form";
import { getContact } from "@/features/contacts/data";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("contacts:write");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const contact = await getContact(id);
  if (!contact) notFound();
  return <section><div className="page-heading"><h1>Edit contact</h1></div><ContactForm contact={contact} /></section>;
}

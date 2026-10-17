import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/session";
import { ContactForm } from "@/features/contacts/contact-form";
import { getContactDropdownOptions } from "@/features/contacts/data";
import { getContact } from "@/features/contacts/data";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("contacts:write");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [contact, options] = await Promise.all([getContact(id), getContactDropdownOptions()]);
  if (!contact) notFound();
  return <section><div className="page-heading"><h1>Edit contact</h1></div><ContactForm contact={contact} options={options} /></section>;
}

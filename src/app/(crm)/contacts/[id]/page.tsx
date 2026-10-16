import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission } from "@/features/auth/session";
import { can } from "@/features/auth/permissions";
import { getContact } from "@/features/contacts/data";
import { deleteContact } from "@/features/contacts/actions";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("contacts:read");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const contact = await getContact(id);
  if (!contact) notFound();
  const name = [contact.first_name, contact.last_name].filter(Boolean).join(" ") || contact.company_name || "Contact";
  return (
    <section>
      <div className="page-heading"><div><h1>{name}</h1><p>{contact.company_name}</p></div></div>
      <div className="content-card">
        <p>Email: {contact.email || "—"}</p><p>Phone: {contact.phone || "—"}</p>
        <p>Mobile: {contact.mobile_phone || "—"}</p>
        <p>Address: {[contact.address_line_1, contact.address_line_2, contact.city, contact.state_region, contact.postal_code].filter(Boolean).join(", ") || "—"}</p>
        <p>Notes: {contact.notes || "—"}</p>
      </div>
      <div className="contact-actions">
        <Link href="/contacts">Back to contacts</Link>
        {can(user.role, "contacts:write") && <><Link href={`/contacts/${id}/edit`}>Edit</Link>
          <form action={deleteContact}><input type="hidden" name="id" value={id} /><button type="submit">Delete contact</button></form></>}
      </div>
    </section>
  );
}

import Link from "next/link";
import { can } from "@/features/auth/permissions";
import { requirePermission } from "@/features/auth/session";
import { listContacts } from "@/features/contacts/data";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const user = await requirePermission("contacts:read");
  const { q = "", page: rawPage = "1" } = await searchParams;
  const page = Math.max(1, Math.min(10000, Number.parseInt(rawPage, 10) || 1));
  const search = q.slice(0, 100);
  const { rows, hasNext } = await listContacts(search, page);

  return (
    <section>
      <div className="page-heading">
        <div><h1>Contacts</h1><p>Customer and business contacts</p></div>
        {can(user.role, "contacts:write") && <Link href="/contacts/new">New Contact</Link>}
      </div>
      <form method="get" className="contact-search">
        <label htmlFor="contact-query">Search contacts</label>
        <input id="contact-query" name="q" defaultValue={search} maxLength={100} />
        <button type="submit">Search</button>
      </form>
      <div className="content-card contact-list-card">
        <table className="contact-table"><thead><tr>
          <th>Company</th><th>Contact</th><th>Phone</th><th>Email</th><th>Location</th><th>Type</th><th>Actions</th>
        </tr></thead><tbody>
          {rows.map((contact) => (
            <tr key={contact.id}>
              <td><strong>{contact.company_name || "—"}</strong></td>
              <td>{[contact.first_name, contact.last_name].filter(Boolean).join(" ") || "—"}</td>
              <td>{contact.phone || "—"}</td>
              <td>{contact.email || "—"}</td>
              <td>{[contact.city, contact.state_region].filter(Boolean).join(", ") || "—"}</td>
              <td><span className="contact-type-badge">{contact.contact_type}</span></td>
              <td><Link href={`/contacts/${contact.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody></table>
        {rows.length === 0 && <p>No contacts found.</p>}
      </div>
      <nav className="contact-actions contact-list-pagination" aria-label="Contacts pagination">
        {page > 1 && <Link href={`/contacts?q=${encodeURIComponent(search)}&page=${page - 1}`}>Previous</Link>}
        <span>Page {page}</span>
        {hasNext && <Link href={`/contacts?q=${encodeURIComponent(search)}&page=${page + 1}`}>Next</Link>}
      </nav>
    </section>
  );
}

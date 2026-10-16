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
        <div><h1>Contacts</h1><p>Customer and business contact records.</p></div>
        {can(user.role, "contacts:write") && <Link href="/contacts/new">Add contact</Link>}
      </div>
      <form method="get" className="contact-search">
        <label htmlFor="contact-query">Search contacts</label>
        <input id="contact-query" name="q" defaultValue={search} maxLength={100} />
        <button type="submit">Search</button>
      </form>
      <div className="content-card">
        <table className="contact-table"><thead><tr>
          <th>Name</th><th>Company</th><th>Email</th><th>Phone</th>
        </tr></thead><tbody>
          {rows.map((contact) => (
            <tr key={contact.id}>
              <td><Link href={`/contacts/${contact.id}`}>{[contact.first_name, contact.last_name].filter(Boolean).join(" ") || contact.company_name}</Link></td>
              <td>{contact.company_name || "—"}</td>
              <td>{contact.email || "—"}</td>
              <td>{contact.phone || "—"}</td>
            </tr>
          ))}
        </tbody></table>
        {rows.length === 0 && <p>No contacts found.</p>}
      </div>
      <nav className="contact-actions" aria-label="Contacts pagination">
        {page > 1 && <Link href={`/contacts?q=${encodeURIComponent(search)}&page=${page - 1}`}>Previous</Link>}
        <span>Page {page}</span>
        {hasNext && <Link href={`/contacts?q=${encodeURIComponent(search)}&page=${page + 1}`}>Next</Link>}
      </nav>
    </section>
  );
}

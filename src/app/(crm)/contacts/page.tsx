import { ButtonIcon } from "@/components/button-icon";
import Link from "next/link";
import { can } from "@/features/auth/permissions";
import { requirePermission } from "@/features/auth/session";
import { setContacted } from "@/features/contacts/actions";
import { ContactFilters } from "@/features/contacts/contact-filters";
import { getContactFilterOptions, listContacts } from "@/features/contacts/data";

type Search = { q?: string; page?: string; region?: string; type?: string; status?: string; contacted?: string };

export default async function ContactsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requirePermission("contacts:read");
  const params = await searchParams;
  const search = (params.q ?? "").slice(0, 100);
  const region = (params.region ?? "").slice(0, 100);
  const type = (params.type ?? "").slice(0, 100);
  const status = (params.status ?? "").slice(0, 100);
  const contacted = params.contacted === "yes" || params.contacted === "no" ? params.contacted : "";
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page ?? "1", 10) || 1));
  const [result, options] = await Promise.all([
    listContacts({ search, region, type, status, contacted }, page),
    getContactFilterOptions(),
  ]);
  const { rows, hasNext } = result;
  const paginationUrl = (next: number) => {
    const qs = new URLSearchParams();
    if (search) qs.set("q", search);
    if (region) qs.set("region", region);
    if (type) qs.set("type", type);
    if (status) qs.set("status", status);
    if (contacted) qs.set("contacted", contacted);
    qs.set("page", String(next));
    return "/contacts?" + qs.toString();
  };

  return (
    <section>
      <div className="page-heading">
        <div><h1>Contacts</h1><p>Customer and business contacts</p></div>
        <div className="crm-heading-actions"><ContactFilters filters={{search,region,type,status,contacted}} options={options} />{can(user.role, "contacts:write") && <Link className="crm-create-contact" href="/contacts/new">Create Contact</Link>}</div>
      </div>
      <div className="content-card contact-list-card">
        <table className="contact-table">
          <thead><tr><th>Company</th><th>Contact</th><th>Phone</th><th>Region</th><th>Location</th><th>Status</th><th>Contacted</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map(contact => <tr key={contact.id}>
              <td><strong>{contact.company_name || "—"}</strong></td>
              <td>{[contact.first_name, contact.last_name].filter(Boolean).join(" ") || "—"}</td>
              <td>{contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : "—"}</td>
              <td>{contact.region || "—"}</td>
              <td>{contact.location || [contact.city, contact.state_region].filter(Boolean).join(", ") || "—"}</td>
              <td><span className="contact-type-badge">{contact.status || "—"}</span></td>
              <td>{can(user.role, "contacts:write") ?
                <form action={setContacted}>
                  <input type="hidden" name="id" value={contact.id} />
                  <input type="hidden" name="contacted" value={String(!contact.contacted)} />
                  <button className="contact-toggle" type="submit" aria-label={contact.contacted ? "Mark not contacted" : "Mark contacted"}>{contact.contacted ? "Yes" : "No"}<ButtonIcon kind="check" /></button>
                </form> : contact.contacted ? "Yes" : "No"}</td>
              <td><Link href={`/contacts/${contact.id}`}>View</Link>{can(user.role, "contacts:write") && <Link className="contact-edit-link" href={`/contacts/${contact.id}/edit`}>Edit</Link>}</td>
            </tr>)}
          </tbody>
        </table>
        {rows.length === 0 && <p className="contact-empty">No contacts found.</p>}
      </div>
      <nav className="contact-actions contact-list-pagination" aria-label="Contacts pagination">
        {page > 1 && <Link href={paginationUrl(page - 1)}>Previous</Link>}
        <span>Page {page}</span>
        {hasNext && <Link href={paginationUrl(page + 1)}>Next</Link>}
      </nav>
    </section>
  );
}

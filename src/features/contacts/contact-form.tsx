import Link from "next/link";
import { saveContact } from "@/features/contacts/actions";
import type { Contact } from "@/features/contacts/data";

export function ContactForm({ contact }: { contact?: Contact }) {
  const inputs = [
    ["first_name", "First name"], ["last_name", "Last name"],
    ["company_name", "Company"], ["email", "Email"],
    ["phone", "Phone"], ["mobile_phone", "Mobile phone"],
    ["address_line_1", "Address line 1"], ["address_line_2", "Address line 2"],
    ["city", "City"], ["state_region", "State / region"],
    ["postal_code", "Postal code"], ["country_code", "Country code"],
  ] as const;
  return (
    <form action={saveContact} className="content-card contact-form">
      {contact && <input type="hidden" name="id" value={contact.id} />}
      <label>Contact type
        <select name="contact_type" defaultValue={contact?.contact_type ?? "person"}>
          <option value="person">Person</option><option value="business">Business</option>
        </select>
      </label>
      <div className="contact-grid">
        {inputs.map(([key, label]) => (
          <label key={key}>{label}
            <input name={key} type={key === "email" ? "email" : "text"}
              maxLength={key === "country_code" ? 2 : 200}
              defaultValue={contact?.[key] ?? (key === "country_code" ? "US" : "")}
              required={key === "country_code"} />
          </label>
        ))}
      </div>
      <label>Notes
        <textarea name="notes" rows={5} maxLength={10000} defaultValue={contact?.notes ?? ""} />
      </label>
      <div className="contact-actions">
        <button type="submit">Save contact</button>
        <Link href="/contacts">Cancel</Link>
      </div>
      <p className="contact-help">A first name, last name, or company is required.</p>
    </form>
  );
}

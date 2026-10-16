"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveContact, type ContactFormState } from "@/features/contacts/actions";
import type { Contact } from "@/features/contacts/data";

const fields = [
  ["first_name", "First name", 150], ["last_name", "Last name", 150],
  ["company_name", "Company", 200], ["email", "Email", 254],
  ["phone", "Phone", 50], ["mobile_phone", "Mobile phone", 50],
  ["address_line_1", "Address line 1", 200], ["address_line_2", "Address line 2", 200],
  ["city", "City", 100], ["state_region", "State / region", 100],
  ["postal_code", "Postal code", 30], ["country_code", "Country code", 2],
] as const;

const initialState: ContactFormState = { error: null, fields: {} };

export function ContactForm({ contact }: { contact?: Contact }) {
  const [state, action, pending] = useActionState(saveContact, initialState);
  const value = (key: keyof Contact) =>
    state.error && key in state.fields
      ? state.fields[key]
      : String(contact?.[key] ?? (key === "country_code" ? "US" : ""));

  return (
    <form action={action} className="content-card contact-form">
      {contact && <input type="hidden" name="id" value={contact.id} />}
      {state.error && <p className="contact-form-error" role="alert">{state.error}</p>}
      <label>Contact type
        <select name="contact_type" key={value("contact_type")} defaultValue={value("contact_type") || "person"}>
          <option value="person">Person</option>
          <option value="business">Business</option>
        </select>
      </label>
      <div className="contact-grid">
        {fields.map(([key, label, maxLength]) => (
          <label key={key}>{label}
            <input
              key={key + value(key)}
              name={key}
              type={key === "email" ? "email" : "text"}
              maxLength={maxLength}
              defaultValue={value(key)}
              required={key === "country_code"}
              aria-invalid={Boolean(state.error && key === "first_name" && !value("first_name") && !value("last_name") && !value("company_name"))}
            />
          </label>
        ))}
      </div>
      <label>Notes
        <textarea key={value("notes")} name="notes" rows={5} maxLength={10000} defaultValue={value("notes")} />
      </label>
      <div className="contact-actions">
        <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save contact"}</button>
        <Link href="/contacts">Cancel</Link>
      </div>
      <p className="contact-help">A first name, last name, or company is required.</p>
    </form>
  );
}

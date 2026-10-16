"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveContact, type ContactFormState } from "@/features/contacts/actions";
import type { Contact } from "@/features/contacts/data";

const initialState: ContactFormState = { error: null, fields: {} };

export function ContactForm({ contact, regions }: { contact?: Contact; regions: {value:string;label:string}[] }) {
  const [state, action, pending] = useActionState(saveContact, initialState);
  const value = (key: keyof Contact) =>
    state.error && key in state.fields
      ? state.fields[key]
      : String(contact?.[key] ?? (key === "country_code" ? "US" : ""));

  const input = (key: keyof Contact, label: string, maxLength: number, type = "text") => (
    <label key={key}>{label}
      <input
        name={key}
        type={type}
        maxLength={maxLength}
        defaultValue={value(key)}
        key={key + value(key)}
        required={key === "country_code"}
      />
    </label>
  );

  return (
    <form action={action} className="contact-form">
      {contact && <input type="hidden" name="id" value={contact.id} />}
      {state.error && <p className="contact-form-error" role="alert">{state.error}</p>}
      <div className="crm-form-panels">
        <section className="crm-form-panel" aria-labelledby="company-heading">
          <h2 id="company-heading">Company</h2>
          {input("company_name", "Company Name", 200)}
          <label>Type
            <select name="contact_type" key={value("contact_type")} defaultValue={value("contact_type") || "person"}>
              <option value="person">Person</option>
              <option value="business">Business</option>
            </select>
          </label>
          {input("location", "Location", 200)}
          <label>Region<select name="region" defaultValue={value("region")} key={value("region")}><option value="">Select...</option>{regions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}{value("region") && !regions.some(option => option.value === value("region")) && <option value={value("region")}>{value("region")} (inactive)</option>}</select></label>
          {input("type", "Category", 100)}
          {input("status", "Status", 100)}
          {input("address_line_1", "Address Line 1", 200)}
          {input("address_line_2", "Address Line 2", 200)}
          {input("city", "City", 100)}
          {input("state_region", "State / Region", 100)}
          {input("postal_code", "Postal Code", 30)}
          {input("country_code", "Country Code", 2)}
        </section>

        <section className="crm-form-panel" aria-labelledby="person-heading">
          <h2 id="person-heading">Person &amp; Contact</h2>
          {input("first_name", "First Name", 150)}
          {input("last_name", "Last Name", 150)}
          {input("phone", "Phone", 50, "tel")}
          {input("mobile_phone", "Mobile Phone", 50, "tel")}
          {input("phone_2", "Secondary Phone", 50, "tel")}
          {input("email", "Email", 254, "email")}
          {input("website", "Website", 200, "url")}
        </section>

        <section className="crm-form-panel crm-form-panel--notes" aria-labelledby="notes-heading">
          <h2 id="notes-heading">Sales Notes</h2>
          <label>Notes
            <textarea name="notes" rows={8} maxLength={10000} key={value("notes")} defaultValue={value("notes")} />
          </label>
          <label>Comments
            <textarea name="comment" rows={5} maxLength={10000} key={value("comment")} defaultValue={value("comment")} />
          </label>
          <div className="contact-actions">
            <button type="submit" disabled={pending}>{pending ? "Saving…" : contact ? "Save Changes" : "Create Contact"}</button>
            <Link href="/contacts">Cancel</Link>
          </div>
        </section>
      </div>
    </form>
  );
}

"use client";
import { ButtonIcon } from "@/components/button-icon";

import Link from "next/link";
import { useActionState } from "react";
import { saveContact, type ContactFormState } from "@/features/contacts/actions";
import type { Contact, ContactDropdownOptions } from "@/features/contacts/data";

const initialState: ContactFormState = { error: null, fields: {} };

export function ContactForm({ contact, options }: { contact?: Contact; options: ContactDropdownOptions }) {
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

  const choice = (name: "type" | "region" | "status", title: string) => {
    const current = value(name);
    const choices = options[name];
    return <label key={name}>{title}
      <select name={name} key={name + current} defaultValue={current}>
        <option value="">Select...</option>
        {choices.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        {current && !choices.some(option => option.value === current) && <option value={current}>{current} (inactive)</option>}
      </select>
    </label>;
  };

  return (
    <form action={action} className="contact-form">
      {contact && <input type="hidden" name="id" value={contact.id} />}
      <input type="hidden" name="contact_type" value={contact?.contact_type ?? "business"} />
      {state.error && <p className="contact-form-error" role="alert">{state.error}</p>}
      <div className="crm-form-panels">
        <section className="crm-form-panel" aria-labelledby="company-heading">
          <h2 id="company-heading">Company</h2>
          {input("company_name", "Company Name", 200)}
          {choice("type", "Type")}
          {input("location", "Location", 200)}
          {choice("region", "Region")}
          {choice("status", "Status")}
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
            <button type="submit" disabled={pending}>{pending ? "Saving…" : contact ? "Save Changes" : "Create Contact"}<ButtonIcon kind="save" /></button>
            <Link href="/contacts">Cancel</Link>
          </div>
        </section>
      </div>
    </form>
  );
}

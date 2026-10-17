import "server-only";
import { getDbPool } from "@/lib/db";

export type Contact = {
  id: string; contact_type: "person" | "business"; first_name: string | null;
  last_name: string | null; company_name: string | null; email: string | null;
  phone: string | null; mobile_phone: string | null; address_line_1: string | null;
  address_line_2: string | null; city: string | null; state_region: string | null;
  postal_code: string | null; country_code: string; notes: string | null;
  region: string | null; type: string | null; location: string | null;
  phone_2: string | null; website: string | null; status: string | null;
  contacted: boolean; last_contacted_date: string | null; comment: string | null;
};

export type ContactFilters = {
  search?: string;
  region?: string;
  type?: string;
  status?: string;
  contacted?: "" | "yes" | "no";
};

export async function listContacts(filters: ContactFilters, page: number) {
  const limit = 15;
  const offset = (page - 1) * limit;
  const search = (filters.search ?? "").trim().slice(0, 100);
  const region = (filters.region ?? "").trim().slice(0, 100);
  const type = (filters.type ?? "").trim().slice(0, 100);
  const status = (filters.status ?? "").trim().slice(0, 100);
  const contacted = filters.contacted === "yes" ? true : filters.contacted === "no" ? false : null;
  const result = await getDbPool().query<Contact>(
    `SELECT id, contact_type, first_name, last_name, company_name, email,
       phone, mobile_phone, address_line_1, address_line_2, city, state_region,
       postal_code, country_code, notes, region, type, location, phone_2, website, status,
       contacted, last_contacted_date, comment
     FROM public.contacts WHERE deleted_at IS NULL
       AND ($1 = '' OR company_name ILIKE '%' || $1 || '%' OR first_name ILIKE '%' || $1 || '%'
         OR last_name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
       AND ($2 = '' OR region = $2)
       AND ($3 = '' OR type = $3)
       AND ($4 = '' OR status = $4)
       AND ($5::boolean IS NULL OR contacted = $5)
     ORDER BY company_name ASC NULLS LAST, id ASC
     LIMIT $6 OFFSET $7`,
    [search, region, type, status, contacted, limit + 1, offset],
  );
  return { rows: result.rows.slice(0, limit), hasNext: result.rows.length > limit };
}

export async function getContactFilterOptions() {
  const result = await getDbPool().query<{
    regions: string[]; types: string[]; statuses: string[];
  }>(`SELECT
    ARRAY(SELECT DISTINCT region FROM public.contacts WHERE deleted_at IS NULL AND nullif(region, '') IS NOT NULL ORDER BY region) AS regions,
    ARRAY(SELECT DISTINCT type FROM public.contacts WHERE deleted_at IS NULL AND nullif(type, '') IS NOT NULL ORDER BY type) AS types,
    ARRAY(SELECT DISTINCT status FROM public.contacts WHERE deleted_at IS NULL AND nullif(status, '') IS NOT NULL ORDER BY status) AS statuses`);
  return result.rows[0];
}

export async function getContact(id: string): Promise<Contact | null> {
  const result = await getDbPool().query<Contact>(
    `SELECT id, contact_type, first_name, last_name, company_name, email,
       phone, mobile_phone, address_line_1, address_line_2, city, state_region,
       postal_code, country_code, notes, region, type, location, phone_2, website, status,
       contacted, last_contacted_date, comment
     FROM public.contacts WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return result.rows[0] ?? null;
}

export type ContactDropdownOptions = Record<"type" | "region" | "status", { value: string; label: string }[]>;

export async function getContactDropdownOptions(): Promise<ContactDropdownOptions> {
  const result = await getDbPool().query<{ category: "type" | "region" | "status"; value: string; label: string }>(
    "SELECT category, value, label FROM public.crm_settings_options WHERE category = ANY($1::text[]) AND active = true ORDER BY category, sort_order, label",
    [["type", "region", "status"]],
  );
  const options: ContactDropdownOptions = { type: [], region: [], status: [] };
  for (const row of result.rows) options[row.category].push({ value: row.value, label: row.label });
  return options;
}

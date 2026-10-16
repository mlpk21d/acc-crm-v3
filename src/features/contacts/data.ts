import "server-only";
import { getDbPool } from "@/lib/db";

export type Contact = {
  id: string; contact_type: "person" | "business"; first_name: string | null;
  last_name: string | null; company_name: string | null; email: string | null;
  phone: string | null; mobile_phone: string | null; address_line_1: string | null;
  address_line_2: string | null; city: string | null; state_region: string | null;
  postal_code: string | null; country_code: string; notes: string | null;
};

export async function listContacts(search: string, page: number) {
  const term = search.trim().slice(0, 100);
  const limit = 25;
  const offset = (page - 1) * limit;
  const result = await getDbPool().query<Contact>(
    `SELECT id, contact_type, first_name, last_name, company_name, email,
       phone, mobile_phone, address_line_1, address_line_2, city, state_region,
       postal_code, country_code, notes
     FROM public.contacts WHERE deleted_at IS NULL
     AND ($1 = '' OR coalesce(first_name, '') ILIKE '%' || $1 || '%'
       OR coalesce(last_name, '') ILIKE '%' || $1 || '%'
       OR coalesce(company_name, '') ILIKE '%' || $1 || '%'
       OR coalesce(email, '') ILIKE '%' || $1 || '%')
     ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
    [term, limit + 1, offset],
  );
  return { rows: result.rows.slice(0, limit), hasNext: result.rows.length > limit };
}

export async function getContact(id: string): Promise<Contact | null> {
  const result = await getDbPool().query<Contact>(
    `SELECT id, contact_type, first_name, last_name, company_name, email,
       phone, mobile_phone, address_line_1, address_line_2, city, state_region,
       postal_code, country_code, notes
     FROM public.contacts WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return result.rows[0] ?? null;
}

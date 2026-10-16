"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";

import { contactFields as fields, parseContactForm, parseContactId } from "@/features/contacts/validation";

export async function saveContact(formData: FormData) {
  const user = await requirePermission("contacts:write");
  const result = parseContactForm(formData);
  if (!result.success) throw new Error("Invalid contact data: " + result.error.issues.map((issue) => issue.message).join("; "));
  const values = result.data;
  const idInput = formData.get("id");
  const validId = parseContactId(idInput);
  const id = validId.success ? String(idInput) : null;
  if (idInput && !id) throw new Error("Invalid contact identifier.");
  const nullable = fields.map((field) =>
    field === "contact_type" || field === "country_code" ? values[field] : values[field] || null
  );
  let savedId: string;
  if (id) {
    const result = await getDbPool().query<{ id: string }>(
      `UPDATE public.contacts SET
        contact_type=$1, first_name=$2, last_name=$3, company_name=$4, email=$5,
        phone=$6, mobile_phone=$7, address_line_1=$8, address_line_2=$9, city=$10,
        state_region=$11, postal_code=$12, country_code=$13, notes=$14,
        updated_by=$15, updated_at=now()
      WHERE id=$16 AND deleted_at IS NULL RETURNING id`,
      [...nullable, user.id, id],
    );
    if (!result.rows[0]) throw new Error("Contact not found.");
    savedId = result.rows[0].id;
  } else {
    const result = await getDbPool().query<{ id: string }>(
      `INSERT INTO public.contacts
      (contact_type, first_name, last_name, company_name, email, phone,
       mobile_phone, address_line_1, address_line_2, city, state_region,
       postal_code, country_code, notes, created_by, updated_by)
       VALUES (${Array.from({ length: 16 }, (_, i) => "$" + (i + 1)).join(", ")})
       RETURNING id`,
      [...nullable, user.id, user.id],
    );
    savedId = result.rows[0].id;
  }
  revalidatePath("/contacts");
  redirect("/contacts/" + savedId);
}

export async function deleteContact(formData: FormData) {
  const user = await requirePermission("contacts:write");
  const parsed = parseContactId(formData.get("id"));
  if (!parsed.success) throw new Error("Invalid contact identifier.");
  const id = parsed.data;
  await getDbPool().query(
    "UPDATE public.contacts SET deleted_at=now(), updated_at=now(), updated_by=$2 WHERE id=$1 AND deleted_at IS NULL",
    [id, user.id],
  );
  revalidatePath("/contacts");
  redirect("/contacts");
}

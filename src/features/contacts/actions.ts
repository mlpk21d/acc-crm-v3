"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";

import { contactFields as fields, parseContactForm, parseContactId } from "@/features/contacts/validation";

export type ContactFormState = {
  error: string | null;
  fields: Record<string, string>;
};

export async function saveContact(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {

  const user = await requirePermission("contacts:write");
  const result = parseContactForm(formData);
  if (!result.success) {
    return {
      error: result.error.issues.map((issue) => issue.message).join("; "),
      fields: Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "")])),
    };
  }
  const values = result.data;
  const idInput = formData.get("id");
  const validId = parseContactId(idInput);
  const id = validId.success ? String(idInput) : null;
  if (idInput && !id) return { error: "Invalid contact identifier.", fields: {} };
  const nullable = fields.map((field) =>
    field === "contact_type" || field === "country_code" ? values[field] : values[field] || null
  );
  let savedId: string;
  const columns = [...fields];
  const quoted = columns.map((field) => '"' + field + '"');
  try {
    if (id) {
      const assignments = quoted.map((column, index) => column + "=$" + (index + 1)).join(", ");
      const result = await getDbPool().query<{ id: string }>(
        "UPDATE public.contacts SET " + assignments +
        ", updated_by=$" + (columns.length + 1) + ", updated_at=now()" +
        " WHERE id=$" + (columns.length + 2) + " AND deleted_at IS NULL RETURNING id",
        [...nullable, user.id, id],
      );
      if (!result.rows[0]) throw new Error("Contact not found.");
      savedId = result.rows[0].id;
    } else {
      const valuesSql = columns.map((_, index) => "$" + (index + 1)).join(", ");
      const result = await getDbPool().query<{ id: string }>(
        "INSERT INTO public.contacts (" + quoted.join(", ") + ", created_by, updated_by)" +
        " VALUES (" + valuesSql + ", $" + (columns.length + 1) + ", $" + (columns.length + 2) + ") RETURNING id",
        [...nullable, user.id, user.id],
      );
      savedId = result.rows[0].id;
    }
  } catch (error) {
    console.error("Failed to save contact:", error);
    return { error: "Unable to save contact. Please try again.", fields: Object.fromEntries(fields.map((field) => [field, values[field]])) };
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

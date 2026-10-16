"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";

export async function saveRegionOption(formData: FormData) {
  await requirePermission("settings:manage");
  const value = String(formData.get("value") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!value || !label || value.length > 100 || label.length > 100) throw new Error("Valid region value and label required.");
  await getDbPool().query(
    `INSERT INTO public.crm_settings_options (category,value,label)
     VALUES ('region',$1,$2)
     ON CONFLICT (category,value) DO UPDATE SET label=EXCLUDED.label, active=true, updated_at=now()`,
    [value,label],
  );
  revalidatePath("/settings");
  revalidatePath("/contacts/new");
  revalidatePath("/contacts");
}

export async function toggleRegionOption(formData: FormData) {
  await requirePermission("settings:manage");
  const value = String(formData.get("value") ?? "");
  const active = formData.get("active") === "true";
  await getDbPool().query(
    "UPDATE public.crm_settings_options SET active=$1,updated_at=now() WHERE category='region' AND value=$2",
    [active,value],
  );
  revalidatePath("/settings");
  revalidatePath("/contacts/new");
  revalidatePath("/contacts");
}

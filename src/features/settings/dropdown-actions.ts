"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";

const categories = ["type","region","status","project_status","manufacturer"] as const;
type Category = typeof categories[number];
function categoryOf(value: FormDataEntryValue | null): Category {
  if (typeof value !== "string" || !categories.includes(value as Category)) throw new Error("Invalid setting category");
  return value as Category;
}
function textValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") throw new Error("Invalid option");
  const normalized = value.trim();
  if (!normalized || normalized.length > 100) throw new Error("Option must contain 1–100 characters");
  return normalized;
}
function colorOf(category: Category, value: FormDataEntryValue | null): string | null {
  if (!["status","project_status","manufacturer"].includes(category)) return null;
  const color = typeof value === "string" && /^#[\da-fA-F]{6}$/.test(value) ? value : "#e5e7eb";
  return color;
}
function refresh() {
  for (const route of ["/settings","/contacts","/contacts/new","/projects","/projects/new"]) revalidatePath(route);
}
export async function addDropdownOption(formData: FormData) {
  await requirePermission("settings:manage");
  const category=categoryOf(formData.get("category"));
  const label=textValue(formData.get("label"));
  const color=colorOf(category,formData.get("color"));
  await getDbPool().query(
    `INSERT INTO public.crm_settings_options (category,value,label,color,sort_order)
       VALUES ($1,$2,$2,$3,COALESCE((SELECT max(sort_order)+1 FROM public.crm_settings_options WHERE category=$1),1))
       ON CONFLICT (category,value) DO NOTHING`,[category,label,color]);
  refresh();
}
export async function editDropdownOption(formData: FormData) {
  await requirePermission("settings:manage");
  const category=categoryOf(formData.get("category"));
  const value=textValue(formData.get("value"));
  const label=textValue(formData.get("label"));
  const color=colorOf(category,formData.get("color"));
  await getDbPool().query("UPDATE public.crm_settings_options SET label=$1,color=$2,updated_at=now() WHERE category=$3 AND value=$4",[label,color,category,value]);
  refresh();
}
export async function toggleDropdownOption(formData: FormData) {
  await requirePermission("settings:manage");
  const category=categoryOf(formData.get("category"));
  const value=textValue(formData.get("value"));
  await getDbPool().query("UPDATE public.crm_settings_options SET active=NOT active,updated_at=now() WHERE category=$1 AND value=$2",[category,value]);
  refresh();
}
export async function moveDropdownOption(formData: FormData) {
  await requirePermission("settings:manage");
  const category=categoryOf(formData.get("category"));
  const value=textValue(formData.get("value"));
  const direction=formData.get("direction")==="up"?"up":"down";
  const client=await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const result=await client.query<{id:string;sort_order:number}>(`SELECT id,sort_order FROM public.crm_settings_options WHERE category=$1 ORDER BY sort_order,label,id FOR UPDATE`,[category]);
    const idx=result.rows.findIndex(row=>row.id===String(formData.get("id") ?? ""));
    const target=idx+(direction==="up"?-1:1);
    if(idx>=0 && target>=0 && target<result.rows.length) {
      const first=result.rows[idx], second=result.rows[target];
      const order=target<idx?target:idx;
      await client.query("UPDATE public.crm_settings_options SET sort_order=$1,updated_at=now() WHERE id=$2",[order,first.id]);
      // Reassign stable unique sequence to avoid duplicate order values.
      const ids=[...result.rows.map(row=>row.id)];
      [ids[idx],ids[target]]=[ids[target],ids[idx]];
      for(let i=0;i<ids.length;i++) await client.query("UPDATE public.crm_settings_options SET sort_order=$1 WHERE id=$2",[i+1,ids[i]]);
    }
    await client.query("COMMIT");
  } catch(error) {await client.query("ROLLBACK");throw error;} finally {client.release();}
  refresh();
}
export async function deleteDropdownOption(formData: FormData) {
  await requirePermission("settings:manage");
  const category=categoryOf(formData.get("category"));
  const value=textValue(formData.get("value"));
  // Retire rather than erase values that historical records may reference.
  await getDbPool().query("UPDATE public.crm_settings_options SET active=false,updated_at=now() WHERE category=$1 AND value=$2",[category,value]);
  refresh();
}

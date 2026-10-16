"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { parseProjectForm } from "@/features/projects/validation";

export type ProjectFormState = { error: string | null };
export async function saveProject(_state: ProjectFormState, form: FormData): Promise<ProjectFormState> {
  const user = await requirePermission("projects:write");
  const parsed = parseProjectForm(form);
  if (!parsed.success) return { error: parsed.error.issues.map(i=>i.message).join("; ") };
  const rawId = form.get("id");
  const id = typeof rawId === "string" && z.uuid().safeParse(rawId).success ? rawId : null;
  if (rawId && !id) return { error: "Invalid project identifier." };
  const {name,contact_id,status,description} = parsed.data;
  const pool = getDbPool();
  try {
    if (contact_id) {
      const valid = await pool.query("SELECT 1 FROM public.contacts WHERE id=$1 AND deleted_at IS NULL", [contact_id]);
      if (!valid.rowCount) return {error:"Choose an active contact."};
    }
    let saved: string;
    if (id) {
      const updated = await pool.query<{id:string}>(`UPDATE public.projects SET name=$1,contact_id=$2,status=$3,description=$4,
        updated_by=$5,updated_at=now() WHERE id=$6 AND deleted_at IS NULL RETURNING id`,
        [name, contact_id||null,status,description||null,user.id,id]);
      if (!updated.rows[0]) return {error:"Project not found."};
      saved = updated.rows[0].id;
    } else {
      const inserted = await pool.query<{id:string}>(`INSERT INTO public.projects
        (name,contact_id,status,description,created_by,updated_by)
        VALUES($1,$2,$3,$4,$5,$5) RETURNING id`,
        [name,contact_id||null,status,description||null,user.id]);
      saved = inserted.rows[0].id;
    }
    revalidatePath("/projects");
    redirect("/projects/"+saved);
  } catch (error) {
    // Re-throw Next.js navigation control flow; do not turn successful saves into errors.
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
    console.error("Project save failed", error);
    return {error:"Unable to save project."};
  }
}

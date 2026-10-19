"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { parseProjectForm } from "@/features/projects/validation";
import { checklistFields } from "@/features/projects/data";

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
  const extra=[parsed.data.project_address,parsed.data.project_contact_name,parsed.data.project_contact_phone,parsed.data.project_designer,parsed.data.next_step,parsed.data.sample_signoff_status,parsed.data.order_by_date||null,parsed.data.official_start_date||null,parsed.data.install_date||null,parsed.data.notes];
  const checklist=checklistFields.map(key=>form.get(key)==="on");
  let saved: string;
  try {
    const allowedStatus = await pool.query(
      "SELECT 1 FROM public.crm_settings_options WHERE category = $1 AND value = $2 AND active = true LIMIT 1",
      ["project_status", status],
    );
    if (!allowedStatus.rowCount) {
      const unchanged = id ? await pool.query(
        "SELECT 1 FROM public.projects WHERE id=$1 AND status=$2 AND deleted_at IS NULL",
        [id, status],
      ) : null;
      if (!unchanged?.rowCount) return { error: "Choose an active Project Status from Settings." };
    }
    if (contact_id) {
      const valid = await pool.query("SELECT 1 FROM public.contacts WHERE id=$1 AND deleted_at IS NULL", [contact_id]);
      if (!valid.rowCount) return {error:"Choose an active contact."};
    }
    if (id) {
      const updated = await pool.query<{id:string}>(`UPDATE public.projects SET name=$1,contact_id=$2,status=$3,description=$4,
        updated_by=$5,updated_at=now(),project_address=$7,project_contact_name=$8,project_contact_phone=$9,project_designer=$10,next_step=$11,sample_signoff_status=$12,order_by_date=$13,official_start_date=$14,install_date=$15,notes=$16 WHERE id=$6 AND deleted_at IS NULL RETURNING id`,
        [name, contact_id||null,status,description||null,user.id,id,...extra]);
      if (!updated.rows[0]) return {error:"Project not found."};
      saved = updated.rows[0].id;
    } else {
      const inserted = await pool.query<{id:string}>(`INSERT INTO public.projects
        (name,contact_id,status,description,created_by,updated_by,project_address,project_contact_name,project_contact_phone,project_designer,next_step,sample_signoff_status,order_by_date,official_start_date,install_date,notes)
        VALUES($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
        [name,contact_id||null,status,description||null,user.id,...extra]);
      saved = inserted.rows[0].id;
    }
    await pool.query(`INSERT INTO public.project_checklist (project_id,drawing_approved,appliance_specs,ceiling_height,floor_thickness,hardware,door_styles,finishes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(project_id) DO UPDATE SET drawing_approved=$2,appliance_specs=$3,ceiling_height=$4,floor_thickness=$5,hardware=$6,door_styles=$7,finishes=$8,updated_at=now()`,[saved,...checklist]);
  } catch (error) {
    console.error("Project save failed", error);
    return {error:"Unable to save project."};
  }
  revalidatePath("/projects");
  redirect("/projects/"+saved);
}

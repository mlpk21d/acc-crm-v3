"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { z } from "zod";

const roomInput=z.object({
 project_id:z.uuid(), room_name:z.string().trim().min(1).max(200),
 door_style:z.string().trim().max(200), drawer_style:z.string().trim().max(200),
 species:z.string().trim().max(200), finish:z.string().trim().max(200),
 construction:z.string().trim().max(200), manufacturer:z.string().trim().max(100),
});
export async function addProjectRoom(form:FormData) {
 await requirePermission("projects:write");
 const parsed=roomInput.safeParse(Object.fromEntries(
  ["project_id","room_name","door_style","drawer_style","species","finish","construction","manufacturer"].map(k=>[k,form.get(k)])));
 if(!parsed.success) throw new Error("Invalid room details.");
 const v=parsed.data;
 const db=getDbPool();
 const project=await db.query("SELECT 1 FROM public.projects WHERE id=$1 AND deleted_at IS NULL",[v.project_id]);
 if(!project.rowCount) throw new Error("Project not found.");
 if(v.manufacturer) {
  const option=await db.query("SELECT 1 FROM public.crm_settings_options WHERE category='manufacturer' AND value=$1 AND active=true",[v.manufacturer]);
  if(!option.rowCount) throw new Error("Select an active manufacturer from Settings.");
 }
 await db.query(`INSERT INTO public.project_rooms
 (project_id,room_name,door_style,drawer_style,species,finish,construction,manufacturer,sort_order)
 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,
 (SELECT COALESCE(MAX(sort_order)+1,1) FROM public.project_rooms WHERE project_id=$1))`,
 [v.project_id,v.room_name,v.door_style||null,v.drawer_style||null,v.species||null,v.finish||null,v.construction||null,v.manufacturer||null]);
 revalidatePath("/projects/"+v.project_id);
}

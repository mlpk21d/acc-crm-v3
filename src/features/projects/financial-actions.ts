"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { z } from "zod";
const money=z.coerce.number().finite().min(0).max(9999999999).refine(v=>Math.round(v*100)===v*100 || Math.abs(Math.round(v*100)-v*100)<1e-7,"Maximum two decimal places");
const payload=z.object({
 project_id:z.uuid(),install_cost:money,misc_cost:money,drawing_cost:money,
 freight:money,doors_pulls:money,margin_type:z.enum(["25","35","other"]),
 custom_margin:z.coerce.number().finite().min(0).max(99)
});
export async function saveProjectFinancials(form:FormData) {
 await requirePermission("settings:manage");
 const v=payload.parse(Object.fromEntries(["project_id","install_cost","misc_cost","drawing_cost","freight","doors_pulls","margin_type","custom_margin"].map(k=>[k,form.get(k)])));
 const res=await getDbPool().query(`INSERT INTO public.project_financials
 (project_id,install_cost,misc_cost,drawing_cost,freight,doors_pulls,margin_type,custom_margin)
 SELECT id,$2,$3,$4,$5,$6,$7,$8 FROM public.projects WHERE id=$1 AND deleted_at IS NULL
 ON CONFLICT(project_id) DO UPDATE SET install_cost=excluded.install_cost,misc_cost=excluded.misc_cost,
 drawing_cost=excluded.drawing_cost,freight=excluded.freight,doors_pulls=excluded.doors_pulls,
 margin_type=excluded.margin_type,custom_margin=excluded.custom_margin,updated_at=now() RETURNING project_id`,
 [v.project_id,v.install_cost,v.misc_cost,v.drawing_cost,v.freight,v.doors_pulls,v.margin_type,v.margin_type==="other"?v.custom_margin/100:0]);
 if(!res.rowCount)throw new Error("Project not found.");
 revalidatePath("/projects/"+v.project_id);
 revalidatePath("/projects/"+v.project_id+"/edit");
 revalidatePath("/projects");
}
export async function saveRoomFinancials(form:FormData) {
 await requirePermission("settings:manage");
 const v=z.object({project_id:z.uuid(),room_id:z.uuid(),room_cost:money,manufacturer_discount:z.coerce.number().finite().min(0).max(100)}).parse(
 Object.fromEntries(["project_id","room_id","room_cost","manufacturer_discount"].map(k=>[k,form.get(k)])));
 const result=await getDbPool().query(`INSERT INTO public.project_room_financials(room_id,room_cost,manufacturer_discount)
 SELECT r.id,$3,$4 FROM public.project_rooms r JOIN public.projects p ON p.id=r.project_id
 WHERE r.id=$1 AND r.project_id=$2 AND p.deleted_at IS NULL
 ON CONFLICT(room_id) DO UPDATE SET room_cost=CASE WHEN EXISTS(SELECT 1 FROM public.jk_room_configs j WHERE j.room_id=$1 AND j.locked=true) THEN project_room_financials.room_cost ELSE excluded.room_cost END,manufacturer_discount=excluded.manufacturer_discount,updated_at=now() RETURNING room_id`,
 [v.room_id,v.project_id,v.room_cost,v.manufacturer_discount]);
 if(!result.rowCount)throw new Error("Room is unavailable.");
 revalidatePath("/projects/"+v.project_id);
 revalidatePath("/projects/"+v.project_id+"/edit");
 revalidatePath("/projects");
}

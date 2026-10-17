"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { z } from "zod";

const roomInput=z.object({
 project_id:z.uuid(), id:z.union([z.uuid(),z.literal("")]), room_name:z.string().trim().min(1).max(200),
 door_style:z.string().trim().max(200), drawer_style:z.string().trim().max(200),
 species:z.string().trim().max(200), finish:z.string().trim().max(200),
 construction:z.string().trim().max(200), manufacturer:z.string().trim().max(100),
});
export async function addProjectRoom(form:FormData) {
 await requirePermission("projects:write");
 const parsed=roomInput.safeParse(Object.fromEntries(
  ["project_id","id","room_name","door_style","drawer_style","species","finish","construction","manufacturer"].map(k=>[k,form.get(k)])));
 if(!parsed.success) throw new Error("Invalid room details.");
 const v=parsed.data;
 const db=getDbPool();
 const project=await db.query("SELECT 1 FROM public.projects WHERE id=$1 AND deleted_at IS NULL",[v.project_id]);
 if(!project.rowCount) throw new Error("Project not found.");
 if(v.manufacturer) {
  const option=await db.query("SELECT 1 FROM public.crm_settings_options WHERE category='manufacturer' AND value=$1 AND active=true",[v.manufacturer]);
  if(!option.rowCount) {
   const existing=v.id ? await db.query("SELECT 1 FROM public.project_rooms WHERE id=$1 AND project_id=$2 AND manufacturer=$3",[v.id,v.project_id,v.manufacturer]) : null;
   if(!existing?.rowCount) throw new Error("Select an active manufacturer from Settings.");
  }
 }
 if(v.id) {
  const updated=await db.query(`UPDATE public.project_rooms SET room_name=$1,door_style=$2,drawer_style=$3,species=$4,finish=$5,construction=$6,manufacturer=$7,updated_at=now() WHERE id=$8 AND project_id=$9 RETURNING id`,[v.room_name,v.door_style||null,v.drawer_style||null,v.species||null,v.finish||null,v.construction||null,v.manufacturer||null,v.id,v.project_id]);
  if(!updated.rowCount) throw new Error("Room not found.");
 } else await db.query(`INSERT INTO public.project_rooms
 (project_id,room_name,door_style,drawer_style,species,finish,construction,manufacturer,sort_order)
 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,
 (SELECT COALESCE(MAX(sort_order)+1,1) FROM public.project_rooms WHERE project_id=$1))`,
 [v.project_id,v.room_name,v.door_style||null,v.drawer_style||null,v.species||null,v.finish||null,v.construction||null,v.manufacturer||null]);
 revalidatePath("/projects/"+v.project_id);
}

export async function deleteProjectRoom(form:FormData) {
 await requirePermission("projects:write");
 const projectId=z.uuid().parse(form.get("project_id"));
 const id=z.uuid().parse(form.get("id"));
 await getDbPool().query("DELETE FROM public.project_rooms WHERE id=$1 AND project_id=$2 AND EXISTS (SELECT 1 FROM public.projects WHERE id=$2 AND deleted_at IS NULL)",[id,projectId]);
 revalidatePath("/projects/"+projectId);
}

export async function moveProjectRoom(form:FormData) {
 await requirePermission("projects:write");
 const projectId=z.uuid().parse(form.get("project_id"));
 const roomId=z.uuid().parse(form.get("id"));
 const direction=form.get("direction")==="up"?-1:1;
 const client=await getDbPool().connect();
 try {
  await client.query("BEGIN");
  const existing=await client.query("SELECT 1 FROM public.projects WHERE id=$1 AND deleted_at IS NULL FOR UPDATE",[projectId]);
  if(!existing.rowCount) throw new Error("Project not found.");
  const result=await client.query<{id:string}>("SELECT id FROM public.project_rooms WHERE project_id=$1 ORDER BY sort_order,id FOR UPDATE",[projectId]);
  const ids=result.rows.map(r=>r.id);
  const idx=ids.indexOf(roomId),to=idx+direction;
  if(idx>=0&&to>=0&&to<ids.length) {
   [ids[idx],ids[to]]=[ids[to],ids[idx]];
   for(let i=0;i<ids.length;i++) await client.query("UPDATE public.project_rooms SET sort_order=$1,updated_at=now() WHERE id=$2 AND project_id=$3",[i+1,ids[i],projectId]);
  }
  await client.query("COMMIT");
 } catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
 revalidatePath("/projects/"+projectId);
}
const rasSchema=z.object({
 project_id:z.uuid(),room_id:z.uuid(),item_name:z.string().trim().min(1).max(200),
 code:z.string().trim().max(100),link:z.union([z.literal(""),z.url().refine(v=>v.startsWith("https://")||v.startsWith("http://"))])
});
export async function addRoomAccessory(form:FormData) {
 await requirePermission("projects:write");
 const v=rasSchema.parse(Object.fromEntries(["project_id","room_id","item_name","code","link"].map(k=>[k,form.get(k)])));
 const result=await getDbPool().query(`INSERT INTO public.rev_a_shelf_items(room_id,item_name,code,link,sort_order)
 SELECT r.id,$3,$4,$5,(SELECT COALESCE(MAX(i.sort_order)+1,1) FROM public.rev_a_shelf_items i WHERE i.room_id=r.id)
 FROM public.project_rooms r JOIN public.projects p ON p.id=r.project_id
 WHERE r.id=$1 AND r.project_id=$2 AND p.deleted_at IS NULL RETURNING id`,[v.room_id,v.project_id,v.item_name,v.code||null,v.link||null]);
 if(!result.rowCount) throw new Error("Room not found.");
 revalidatePath("/projects/"+v.project_id);
}
export async function deleteRoomAccessory(form:FormData) {
 await requirePermission("projects:write");
 const projectId=z.uuid().parse(form.get("project_id"));
 const roomId=z.uuid().parse(form.get("room_id"));
 const id=z.uuid().parse(form.get("id"));
 await getDbPool().query(`DELETE FROM public.rev_a_shelf_items i USING public.project_rooms r,public.projects p
 WHERE i.id=$1 AND i.room_id=$2 AND r.id=i.room_id AND r.project_id=$3 AND p.id=r.project_id AND p.deleted_at IS NULL`,[id,roomId,projectId]);
 revalidatePath("/projects/"+projectId);
}

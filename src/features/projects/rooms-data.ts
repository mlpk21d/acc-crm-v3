import "server-only";
import { getDbPool } from "@/lib/db";

export type ProjectRoom = {
 id:string; project_id:string; room_name:string; enabled:boolean;
 door_style:string|null; drawer_style:string|null; species:string|null;
 finish:string|null; construction:string|null; manufacturer:string|null;
 manufacturer_color:string|null;
 ras_items: {id:string;item_name:string;code:string|null;link:string|null}[];
};
export async function listProjectRooms(projectId:string):Promise<ProjectRoom[]> {
 const {rows}=await getDbPool().query<ProjectRoom>(
  `SELECT r.id,r.project_id,r.room_name,r.enabled,r.door_style,r.drawer_style,r.species,r.finish,r.construction,r.manufacturer,
   s.color AS manufacturer_color,
   COALESCE((SELECT jsonb_agg(jsonb_build_object('id',i.id,'item_name',i.item_name,'code',i.code,'link',i.link) ORDER BY i.sort_order,i.id) FROM public.rev_a_shelf_items i WHERE i.room_id=r.id),'[]'::jsonb) AS ras_items FROM public.project_rooms r
   LEFT JOIN public.crm_settings_options s ON s.category='manufacturer' AND s.value=r.manufacturer
   WHERE r.project_id=$1 ORDER BY r.sort_order,r.id`,[projectId]);
 return rows;
}
export async function manufacturerChoices() {
 const {rows}=await getDbPool().query<{value:string;label:string;color:string|null}>(
  "SELECT value,label,color FROM public.crm_settings_options WHERE category='manufacturer' AND active=true ORDER BY sort_order,label");
 return rows;
}

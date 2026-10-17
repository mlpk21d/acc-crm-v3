import "server-only";
import { getDbPool } from "@/lib/db";

export type ProjectRoom = {
 id:string; project_id:string; room_name:string;
 door_style:string|null; drawer_style:string|null; species:string|null;
 finish:string|null; construction:string|null; manufacturer:string|null;
 manufacturer_color:string|null;
};
export async function listProjectRooms(projectId:string):Promise<ProjectRoom[]> {
 const {rows}=await getDbPool().query<ProjectRoom>(
  `SELECT r.id,r.project_id,r.room_name,r.door_style,r.drawer_style,r.species,r.finish,r.construction,r.manufacturer,
   s.color AS manufacturer_color FROM public.project_rooms r
   LEFT JOIN public.crm_settings_options s ON s.category='manufacturer' AND s.value=r.manufacturer
   WHERE r.project_id=$1 ORDER BY r.sort_order,r.id`,[projectId]);
 return rows;
}
export async function manufacturerChoices() {
 const {rows}=await getDbPool().query<{value:string;label:string}>(
  "SELECT value,label FROM public.crm_settings_options WHERE category='manufacturer' AND active=true ORDER BY sort_order,label");
 return rows;
}

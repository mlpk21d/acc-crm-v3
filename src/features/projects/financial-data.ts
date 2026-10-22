import "server-only";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
export type ProjectFinancials={
 install_cost:string;misc_cost:string;drawing_cost:string;freight:string;doors_pulls:string;
 margin_type:"25"|"35"|"other";custom_margin:string;
};
export type RoomFinancial={room_id:string;enabled:boolean;room_cost:string;manufacturer_discount:string;jk_locked:boolean};
export const emptyFinancials:ProjectFinancials={install_cost:"0",misc_cost:"0",drawing_cost:"0",freight:"0",doors_pulls:"0",margin_type:"35",custom_margin:"0"};
export async function getProjectFinancials(projectId:string):Promise<{project:ProjectFinancials;rooms:RoomFinancial[]}> {
 await requirePermission("settings:manage");
 const db=getDbPool();
 const [header,rooms]=await Promise.all([
  db.query<ProjectFinancials>("SELECT install_cost::text,misc_cost::text,drawing_cost::text,freight::text,doors_pulls::text,margin_type,custom_margin::text FROM public.project_financials WHERE project_id=$1",[projectId]),
  db.query<RoomFinancial>(`SELECT r.id AS room_id,r.enabled,COALESCE(f.room_cost,0)::text AS room_cost,COALESCE(f.manufacturer_discount,0)::text AS manufacturer_discount, COALESCE(j.locked,false) AS jk_locked
    FROM public.project_rooms r LEFT JOIN public.project_room_financials f ON f.room_id=r.id LEFT JOIN public.jk_room_configs j ON j.room_id=r.id WHERE r.project_id=$1 ORDER BY r.sort_order,r.id`,[projectId])
 ]);
 return {project:header.rows[0]??emptyFinancials,rooms:rooms.rows};
}
export function summarizeProjectFinancials(fin:ProjectFinancials,rooms:RoomFinancial[]) {
 const cents=(s:string)=>Math.round(Number(s)*100);
 const roomCents=rooms.filter(r=>r.enabled!==false).reduce((sum,r)=>sum+Math.round(cents(r.room_cost)*(1-Number(r.manufacturer_discount)/100)),0);
 const base=roomCents+["install_cost","misc_cost","drawing_cost","freight","doors_pulls"].reduce((sum,key)=>sum+cents(fin[key as keyof ProjectFinancials]),0);
 const margin=fin.margin_type==="other"?Number(fin.custom_margin):Number(fin.margin_type)/100;
 const totalCost=margin>=0&&margin<1?Math.round(base/(1-margin)):base;
 return {roomCosts:roomCents/100,total:base/100,totalCost:totalCost/100,profit:(totalCost-base)/100,margin:margin*100};
}

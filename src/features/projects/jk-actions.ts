"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { searchJkPriceItems, getJkRoomConfig } from "@/features/projects/jk-data";
import { z } from "zod";

const cabinetSchema=z.object({
 price_item_id:z.uuid().nullable(),item:z.string().trim().min(1).max(150),
 description:z.string().trim().max(2000),hinge_direction:z.enum(["","L","R"]),
 quantity:z.number().int().min(1).max(10000),custom:z.boolean(),
 price:z.number().finite().min(0).max(99999999).optional()
});
const configSchema=z.object({
 projectId:z.uuid(),roomId:z.uuid(),
 assemblyCount:z.number().int().min(0).max(10000),
 items:z.array(cabinetSchema).max(250)
});
export async function saveJkConfiguration(input:unknown) {
 await requirePermission("settings:manage"); // admin-only financial permissions
 const v=configSchema.parse(input);
 const client=await getDbPool().connect();
 try {
  await client.query("BEGIN");
  const room=await client.query<{manufacturer:string|null}>(`SELECT r.manufacturer FROM public.project_rooms r
   JOIN public.projects p ON p.id=r.project_id
   WHERE r.id=$1 AND r.project_id=$2 AND p.deleted_at IS NULL FOR UPDATE OF r`,[v.roomId,v.projectId]);
  if(!room.rows[0] || room.rows[0].manufacturer!=="J&K") throw new Error("J&K configuration requires a J&K room.");
  const prepared=[];
  for(const item of v.items) {
   let price:number;
   let catalogId:string|null=null;
   if(item.custom) {
    if(item.price_item_id!==null) throw new Error("Custom items cannot reference a catalog item.");
    if(item.price===undefined) throw new Error("Custom item price is required.");
    price=Math.round(item.price*100);
   } else {
    if(!item.price_item_id) throw new Error("Catalog item is required.");
    const found=await client.query<{price:string;item:string;description:string|null}>(`SELECT price::text,item,description
     FROM public.jk_price_items WHERE id=$1 AND active=true`,[item.price_item_id]);
    if(!found.rows[0]) throw new Error("Catalog item is unavailable.");
    const raw=found.rows[0];
    price=Math.round(Number(raw.price)*100);
    catalogId=item.price_item_id;
    item.item=raw.item;
    item.description=raw.description??"";
   }
   if(!Number.isSafeInteger(price)||price<0) throw new Error("Invalid price.");
   const discounted=Math.round(price*80/100);
   prepared.push({item,catalogId,price,discounted});
  }
  await client.query(`INSERT INTO public.jk_room_configs(room_id,assembly_count,locked,updated_at)
   VALUES($1,$2,true,now()) ON CONFLICT(room_id)
   DO UPDATE SET assembly_count=excluded.assembly_count,locked=true,updated_at=now()`,[v.roomId,v.assemblyCount]);
  await client.query("DELETE FROM public.jk_room_cabinet_items WHERE room_id=$1",[v.roomId]);
  for(let i=0;i<prepared.length;i++){
   const p=prepared[i];
   await client.query(`INSERT INTO public.jk_room_cabinet_items
    (room_id,price_item_id,item,description,hinge_direction,unit_price,discounted_price,quantity,custom,sort_order)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [v.roomId,p.catalogId,p.item.item,p.item.description,p.item.hinge_direction,
     (p.price/100).toFixed(2),(p.discounted/100).toFixed(2),p.item.quantity,p.item.custom,i+1]);
  }
  const totalCents=prepared.reduce((sum,p)=>sum+p.discounted*p.item.quantity,0)+v.assemblyCount*2000;
  if(!Number.isSafeInteger(totalCents)) throw new Error("Invalid configuration total.");
  // Match the legacy CRM: a configured J&K room gets its cost from the cabinet total.
  // Preserve any existing manufacturer discount independently.
  await client.query(`INSERT INTO public.project_room_financials(room_id,room_cost,manufacturer_discount)
   VALUES($1,$2,0) ON CONFLICT(room_id) DO UPDATE SET room_cost=excluded.room_cost,updated_at=now()`,
   [v.roomId,(totalCents/100).toFixed(2)]);
  await client.query("COMMIT");
  revalidatePath("/projects/"+v.projectId);
  return {total:(totalCents/100).toFixed(2)};
 }catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
}

export async function searchJkCatalogAction(term:string) {
 await requirePermission("settings:manage");
 return searchJkPriceItems(term);
}
export async function loadJkConfigAction(projectId:string,roomId:string) {
 await requirePermission("settings:manage");
 const project=z.uuid().parse(projectId),room=z.uuid().parse(roomId);
 const match=await getDbPool().query("SELECT 1 FROM public.project_rooms r JOIN public.projects p ON p.id=r.project_id WHERE r.id=$1 AND r.project_id=$2 AND r.manufacturer='J&K' AND p.deleted_at IS NULL",[room,project]);
 if(!match.rowCount) throw new Error("J&K room not found.");
 return getJkRoomConfig(room);
}

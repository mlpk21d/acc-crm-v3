import "server-only";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { z } from "zod";

// J&K pricing must never be returned through a projects:read query.
// settings:manage is currently admin-only in the V3 role matrix.
async function requireJkPricingAdmin() {
 await requirePermission("settings:manage");
}
export type JkPriceItem = {
 id:string; item:string;description:string|null;price:string;msrp:string|null;
};
export type JkCabinetItem = {
 id:string; price_item_id:string|null; item:string;description:string|null;
 hinge_direction:""|"L"|"R";unit_price:string;discounted_price:string;
 quantity:number;custom:boolean;sort_order:number;
};
export async function searchJkPriceItems(term:string):Promise<JkPriceItem[]> {
 await requireJkPricingAdmin();
 const q=z.string().trim().min(1).max(100).safeParse(term);
 if(!q.success) return [];
 const escaped=q.data.replace(/[\\%_]/g, "\\$&");
 const {rows}=await getDbPool().query<JkPriceItem>(
  `SELECT id,item,description,price::text,msrp::text FROM public.jk_price_items
   WHERE active=true AND (item ILIKE '%' || $1 || '%' ESCAPE '\\'
     OR description ILIKE '%' || $1 || '%' ESCAPE '\\')
   ORDER BY item,id LIMIT 15`,[escaped]);
 return rows;
}
export async function getJkRoomConfig(roomId:string) {
 await requireJkPricingAdmin();
 const id=z.uuid().parse(roomId);
 const [config,items]=await Promise.all([
  getDbPool().query<{assembly_count:number;locked:boolean}>(
   "SELECT assembly_count,locked FROM public.jk_room_configs WHERE room_id=$1",[id]),
  getDbPool().query<JkCabinetItem>(
   `SELECT id,price_item_id,item,description,hinge_direction,unit_price::text,
     discounted_price::text,quantity,custom,sort_order
     FROM public.jk_room_cabinet_items WHERE room_id=$1 ORDER BY sort_order,id`,[id])
 ]);
 return {assemblyCount:config.rows[0]?.assembly_count??0,locked:config.rows[0]?.locked??false,items:items.rows};
}

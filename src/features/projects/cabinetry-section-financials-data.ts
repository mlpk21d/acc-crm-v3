import "server-only";
import type {PoolClient} from "pg";

export async function saveSectionFinancials(client:PoolClient,roomId:string,entries:{
 section_id:string;
 room_cost:number;
 manufacturer_discount:number;
}[]) {
 for(const entry of entries){
  await client.query(
   `INSERT INTO public.cabinetry_section_financials(room_id,section_id,room_cost,manufacturer_discount)
    VALUES($1,$2,$3,$4) ON CONFLICT(room_id,section_id) DO UPDATE SET
    room_cost=excluded.room_cost,manufacturer_discount=excluded.manufacturer_discount`,
   [roomId,entry.section_id,entry.room_cost,entry.manufacturer_discount],
  );
 }
}

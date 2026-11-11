import {z} from "zod";
import {maxCabinetrySections,type CabinetrySection} from "./cabinetry-sections";

export type CabinetrySectionFinancial = {
 section_id: string;
 room_cost: string;
 manufacturer_discount: string;
};

export const sectionFinancialsSchema = z.array(z.object({
 section_id: z.uuid(),
 room_cost: z.coerce.number().finite().min(0).max(99999999)
  .refine(value=>Math.abs(value*100-Math.round(value*100))<.000001),
 manufacturer_discount: z.coerce.number().finite().min(0).max(100)
  .refine(value=>Math.abs(value*1000-Math.round(value*1000))<.000001),
})).max(maxCabinetrySections)
 .refine(entries=>new Set(entries.map(entry=>entry.section_id)).size===entries.length);

export function sectionFinancialsMatch(sections: CabinetrySection[], entries: {section_id:string}[]) {
 const ids = new Set(sections.map(section=>section.id));
 return entries.every(entry=>ids.has(entry.section_id));
}

export function totalRoomCostCents(rooms: {
 enabled:boolean;
 room_cost:string;
 manufacturer_discount:string;
 section_financials:CabinetrySectionFinancial[];
}[]) {
 return rooms.filter(room=>room.enabled).reduce((total,room)=>{
  const costs = [room,...room.section_financials];
  return total+costs.reduce((sum,cost)=>{
   const cents = Math.round(Number(cost.room_cost)*100);
   const discount = Math.round(Number(cost.manufacturer_discount)*1000);
   return sum+Math.round(cents*(100000-discount)/100000);
  },0);
 },0);
}

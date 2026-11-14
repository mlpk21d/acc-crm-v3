import {z} from 'zod';
export function inches(value:string):number {
 const m=value.trim().match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
 if(m){const denominator=Number(m[3]);return denominator>0?Number(m[1]??0)+Number(m[2])/denominator:NaN;}
 return /^\d+(?:\.\d+)?$/.test(value.trim())?Number(value):NaN;
}
const dimension=z.string().trim().max(24).refine(v=>inches(v)>0&&inches(v)<=240,'Enter inches, such as 16 1/4.');
export const rowSchema=z.object({id:z.string().uuid(),kind:z.enum(['Door','Drawer']),width:dimension,height:dimension,quantity:z.number().int().min(1).max(10000),numbers:z.string().trim().min(1).max(1000).regex(/^\d+(?:\s*,\s*\d+)*$/),source:z.string().max(2000),reviewed:z.boolean()});
export const roomSchema=z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(120),style:z.string().trim().max(120),species:z.string().trim().max(120),rows:z.array(rowSchema).max(1000)});
export const orderSchema=z.object({name:z.string().trim().min(1).max(160),rooms:z.array(roomSchema).min(1).max(100),warnings:z.array(z.string().max(2000)).max(1000)}).refine(v=>new Set(v.rooms.map(r=>r.id)).size===v.rooms.length,'Duplicate rooms.');
export type DoorRow=z.infer<typeof rowSchema>;
export type DoorRoom=z.infer<typeof roomSchema>;
export type DoorOrder=z.infer<typeof orderSchema>;
export function sortRows(rows:DoorRow[]){return [...rows].sort((a,b)=>(a.kind===b.kind?0:a.kind==='Door'?-1:1)||inches(b.height)-inches(a.height)||inches(b.width)-inches(a.width));}
export function groupRows(rows:DoorRow[]):DoorRow[]{
 const groups=new Map<string,DoorRow>();
 for(const row of rows){const key=`${row.kind}:${inches(row.width)}:${inches(row.height)}`;const prior=groups.get(key);if(prior){prior.quantity+=row.quantity;prior.numbers=[...new Set(`${prior.numbers},${row.numbers}`.split(',').map(n=>n.trim()))].sort((a,b)=>Number(a)-Number(b)).join(', ');prior.source=[...new Set([prior.source,row.source])].filter(Boolean).join('; ');prior.reviewed=prior.reviewed&&row.reviewed;}else groups.set(key,{...row});}
 return sortRows([...groups.values()]);
}

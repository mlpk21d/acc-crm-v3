import {z} from 'zod';
export const mediaSchema=z.array(z.object({
 id:z.uuid(),title:z.string().trim().max(200),fresh:z.boolean(),
 room_id:z.uuid().nullable(),is_main:z.boolean(),
})).max(20)
 .refine(items=>new Set(items.map(item=>item.id)).size===items.length)
 .refine(items=>items.filter(item=>item.is_main).length<=1)
 .refine(items=>items.every(item=>item.is_main||item.room_id!==null));

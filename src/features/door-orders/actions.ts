'use server';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {requirePermission} from '@/features/auth/session';
import {getDbPool} from '@/lib/db';
import {orderSchema} from './model';
export async function saveDoorOrder(input:unknown,id?:string,revision?:number){
 const user=await requirePermission('invoices:write');const parsed=orderSchema.safeParse(input);
 if(!parsed.success)return {error:parsed.error.issues[0]?.message??'Invalid order.'};
 if(JSON.stringify(parsed.data).length>2_000_000)return {error:'This order is too large.'};
 if(id&&(!z.uuid().safeParse(id).success||!Number.isInteger(revision)))return {error:'Invalid order reference.'};
 try{const db=getDbPool();const result=id?await db.query<{id:string;revision:number}>(`UPDATE public.door_orders SET name=$1,document=$2,updated_by=$3,updated_at=now(),revision=revision+1 WHERE id=$4 AND revision=$5 RETURNING id,revision`,[parsed.data.name,JSON.stringify(parsed.data),user.id,id,revision]):await db.query<{id:string;revision:number}>(`INSERT INTO public.door_orders(name,document,created_by,updated_by) VALUES($1,$2,$3,$3) RETURNING id,revision`,[parsed.data.name,JSON.stringify(parsed.data),user.id]);
 if(!result.rows[0])return {error:'This order changed in another session. Reload it before saving.'};revalidatePath('/door-orders');if(id)revalidatePath(`/door-orders/${id}`);return result.rows[0];
 }catch(error){console.error('Door order save failed',error);return {error:'Unable to save the door order. Please try again.'};}
}

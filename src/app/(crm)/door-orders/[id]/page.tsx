import {notFound} from 'next/navigation';
import {z} from 'zod';
import {requirePermission} from '@/features/auth/session';
import {can} from '@/features/auth/permissions';
import {getDbPool} from '@/lib/db';
import {DoorOrderEditor} from '@/features/door-orders/editor';
import type {DoorOrder} from '@/features/door-orders/model';
export default async function DoorOrderPage({params}:{params:Promise<{id:string}>}){const user=await requirePermission('invoices:read');const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();const {rows}=await getDbPool().query<{document:DoorOrder;revision:number}>('SELECT document,revision FROM public.door_orders WHERE id=$1',[id]);if(!rows[0])notFound();return <DoorOrderEditor id={id} initial={rows[0].document} revision={rows[0].revision} editable={can(user.role,'invoices:write')}/>;}

import {z} from 'zod';
import {getCurrentCrmUser} from '@/features/auth/session';
import {can} from '@/features/auth/permissions';
import {getDbPool} from '@/lib/db';
import {orderSchema} from '@/features/door-orders/model';
import {doorOrderPdf} from '@/features/door-orders/pdf';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await getCurrentCrmUser();if(!user)return new Response('Sign in required',{status:401});if(!can(user.role,'invoices:read'))return new Response('Forbidden',{status:403});const {id}=await params;if(!z.uuid().safeParse(id).success)return new Response('Not found',{status:404});
 const {rows}=await getDbPool().query('SELECT document FROM public.door_orders WHERE id=$1',[id]);if(!rows[0])return new Response('Not found',{status:404});const order=orderSchema.parse(rows[0].document);
 if(order.rooms.some(r=>!r.style||!r.species||r.name.startsWith('Unassigned')||r.rows.some(row=>!row.reviewed)))return new Response('Complete room styles/species and review every row before exporting.',{status:409});
 const bytes=await doorOrderPdf(order);const filename=order.name.replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,100)||'Order';return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${filename}-Door-Order.pdf"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}

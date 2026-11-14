import Link from 'next/link';
import {ButtonIcon} from '@/components/button-icon';
import {requirePermission} from '@/features/auth/session';
import {can} from '@/features/auth/permissions';
import {getDbPool} from '@/lib/db';
export default async function DoorOrdersPage({searchParams}:{searchParams:Promise<{page?:string}>}){
 const user=await requirePermission('invoices:read');const params=await searchParams;const page=Math.max(1,Math.min(100000,Number(params.page)||1));const {rows}=await getDbPool().query<{id:string;name:string;updated_at:Date}>(`SELECT id,name,updated_at FROM public.door_orders ORDER BY updated_at DESC,id LIMIT 51 OFFSET $1`,[(Math.floor(page)-1)*50]);
 return <div className="door-order-editor"><div className="page-heading"><h1>Door Orders</h1>{can(user.role,'invoices:write')&&<Link className="button" href="/door-orders/new"><ButtonIcon kind="add"/>New Door Order</Link>}</div><section className="crm-form-panel door-order-table">{!rows.length?<p>No door orders yet. Import KCD drawings and a door/front size list to get started.</p>:<table><thead><tr><th>Order Name</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{rows.slice(0,50).map(row=><tr key={row.id}><td><Link href={`/door-orders/${row.id}`}>{row.name}</Link></td><td>{row.updated_at.toLocaleDateString('en-US')}</td><td><Link className="button button-secondary" href={`/door-orders/${row.id}`}><ButtonIcon kind="eye"/>Review</Link></td></tr>)}</tbody></table>}<div className="door-order-actions">{page>1&&<Link className="button button-secondary" href={`/door-orders?page=${page-1}`}><ButtonIcon kind="back"/>Previous</Link>}{rows.length>50&&<Link className="button button-secondary" href={`/door-orders?page=${page+1}`}><ButtonIcon kind="arrow-left"/>Next</Link>}</div></section></div>;
}

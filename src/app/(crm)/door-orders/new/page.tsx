import {requirePermission} from '@/features/auth/session';
import {DoorOrderEditor} from '@/features/door-orders/editor';
export default async function NewDoorOrderPage(){await requirePermission('invoices:write');return <DoorOrderEditor/>;}

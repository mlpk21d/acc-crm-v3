import 'server-only';
import {getCurrentCrmUser} from '@/features/auth/session';
import {can} from '@/features/auth/permissions';
export const privateHeaders={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
export async function proposalApiDenied(){const user=await getCurrentCrmUser();return !user?new Response('Please sign in.',{status:401,headers:privateHeaders}):!can(user.role,'settings:manage')?new Response('Forbidden',{status:403,headers:privateHeaders}):null;}

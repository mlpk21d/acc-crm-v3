import {z} from 'zod';
import {getDbPool} from '@/lib/db';
import {privateHeaders,proposalApiDenied} from '@/features/proposals/api';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string;mediaId:string}>}){
 const denied=await proposalApiDenied();if(denied)return denied;
 const {id,mediaId}=await params;
 if(!z.uuid().safeParse(id).success||!z.uuid().safeParse(mediaId).success)return new Response('Not found',{status:404,headers:privateHeaders});
 const media=(await getDbPool().query<{image_data:Buffer;mime_type:string}>(`SELECT m.image_data,m.mime_type FROM public.proposal_media m JOIN public.proposals pr ON pr.id=m.proposal_id JOIN public.projects p ON p.id=pr.project_id WHERE m.id=$1 AND m.proposal_id=$2 AND p.deleted_at IS NULL`,[mediaId,id])).rows[0];
 if(!media)return new Response('Not found',{status:404,headers:privateHeaders});
 return new Response(new Uint8Array(media.image_data),{headers:{...privateHeaders,'Content-Type':media.mime_type,'Content-Disposition':'inline'}});
}

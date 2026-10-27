import {getProposal} from '@/features/proposals/data';
import {getDbPool} from '@/lib/db';
import {listProjectRooms} from '@/features/projects/rooms-data';
import {privateHeaders,proposalApiDenied} from '@/features/proposals/api';
import {createProposalPdf} from '@/features/proposals/pdf';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const denied=await proposalApiDenied();if(denied)return denied;
 const {id}=await params;const data=await getProposal(id);
 if(!data)return new Response('Proposal not found',{status:404,headers:privateHeaders});
 const rooms=data.proposal.include_room_finishes?await listProjectRooms(data.project.id):[];
 const media=(await getDbPool().query<{title:string;image_data:Buffer}>('SELECT title,image_data FROM public.proposal_media WHERE proposal_id=$1 ORDER BY sort_order,id',[id])).rows;
 const pdf=await createProposalPdf(data.proposal,data.project,rooms,media);
 const name=data.project.name.replace(/[^a-zA-Z0-9]+/g,'-').slice(0,100)||'Project';
 return new Response(new Uint8Array(pdf),{headers:{...privateHeaders,'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${name}-Proposal.pdf"`}});
}

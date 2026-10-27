import {getProposalProject,searchProposalProjects} from '@/features/proposals/data';
import {privateHeaders,proposalApiDenied} from '@/features/proposals/api';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const denied=await proposalApiDenied();if(denied)return denied;
 const params=new URL(request.url).searchParams;const id=params.get('id');
 const result=id?await getProposalProject(id):await searchProposalProjects(params.get('q')??'');
 return Response.json(result,{status:result?200:404,headers:privateHeaders});
}

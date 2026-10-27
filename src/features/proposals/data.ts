import 'server-only';
import {z} from 'zod';
import {getDbPool} from '@/lib/db';
import {requirePermission} from '@/features/auth/session';
import {getProjectFinancials,summarizeProjectFinancials} from '@/features/projects/financial-data';
import type {Proposal,ProposalMedia,ProposalProject} from './model';
const contactSql=`COALESCE(NULLIF(trim(concat_ws(' ',c.first_name,c.last_name)),''),c.company_name,NULLIF(p.project_contact_name,''),'')`;
export async function searchProposalProjects(query:string) {
 await requirePermission('settings:manage');
 const q=query.trim().slice(0,100).replace(/[\\%_]/g,'\\$&');
 return (await getDbPool().query<Omit<ProposalProject,'price'>>(`SELECT p.id,p.name,${contactSql} AS contact FROM public.projects p LEFT JOIN public.contacts c ON c.id=p.contact_id WHERE p.deleted_at IS NULL AND ($1='' OR p.name ILIKE '%'||$1||'%') ORDER BY p.name,p.id LIMIT 25`,[q])).rows;
}
export async function getProposalProject(id:string):Promise<ProposalProject|null> {
 await requirePermission('settings:manage');
 if(!z.uuid().safeParse(id).success)return null;
 const project=(await getDbPool().query<Omit<ProposalProject,'price'>>(`SELECT p.id,p.name,${contactSql} AS contact FROM public.projects p LEFT JOIN public.contacts c ON c.id=p.contact_id WHERE p.id=$1 AND p.deleted_at IS NULL`,[id])).rows[0];
 if(!project)return null;
 const financials=await getProjectFinancials(id);
 return {...project,price:summarizeProjectFinancials(financials.project,financials.rooms).totalCost.toFixed(2)};
}
export async function listProposals(query:string,page:number) {
 await requirePermission('settings:manage');
 const q=query.trim().slice(0,100).replace(/[\\%_]/g,'\\$&');
 return (await getDbPool().query<{id:string;name:string;contact:string;created_at:Date}>(`SELECT pr.id,p.name,${contactSql} AS contact,pr.created_at FROM public.proposals pr JOIN public.projects p ON p.id=pr.project_id LEFT JOIN public.contacts c ON c.id=p.contact_id WHERE p.deleted_at IS NULL AND ($1='' OR p.name ILIKE '%'||$1||'%') ORDER BY pr.created_at DESC,pr.id DESC LIMIT 26 OFFSET $2`,[q,(page-1)*25])).rows;
}
export async function getProposal(id:string) {
 await requirePermission('settings:manage');
 if(!z.uuid().safeParse(id).success)return null;
 const proposal=(await getDbPool().query<Proposal>('SELECT pr.* FROM public.proposals pr JOIN public.projects p ON p.id=pr.project_id WHERE pr.id=$1 AND p.deleted_at IS NULL',[id])).rows[0];
 if(!proposal)return null;
 const project=await getProposalProject(proposal.project_id);
 if(!project)return null;
 const media=(await getDbPool().query<ProposalMedia>('SELECT id,title,filename FROM public.proposal_media WHERE proposal_id=$1 ORDER BY sort_order,id',[id])).rows;
 return {proposal,project,media};
}

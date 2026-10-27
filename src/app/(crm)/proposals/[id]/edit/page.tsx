import {notFound} from 'next/navigation';
import {getProposal} from '@/features/proposals/data';
import {ProposalForm} from '@/features/proposals/proposal-form';
export default async function EditProposal({params}:{params:Promise<{id:string}>}){const {id}=await params;const data=await getProposal(id);if(!data)notFound();return <section><div className="page-heading"><h1>Edit Proposal</h1></div><ProposalForm proposal={data.proposal} initialProject={data.project} initialMedia={data.media}/></section>;}

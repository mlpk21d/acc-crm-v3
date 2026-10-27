import {requirePermission} from '@/features/auth/session';
import {ProposalForm} from '@/features/proposals/proposal-form';
export default async function NewProposal(){await requirePermission('settings:manage');return <section><div className="page-heading"><h1>New Proposal</h1></div><ProposalForm/></section>;}

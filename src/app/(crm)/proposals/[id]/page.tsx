import Link from 'next/link';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {ButtonIcon} from '@/components/button-icon';
import {getProposal} from '@/features/proposals/data';
import {depositAmount,money} from '@/features/proposals/model';
export default async function ViewProposal({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const data=await getProposal(id);if(!data)notFound();const {project,proposal,media}=data;
 return <section><div className="page-heading"><h1>{project.name}</h1><div className="proposal-actions"><Link className="proposal-button" href="/proposals"><ButtonIcon kind="back"/>Back</Link><Link className="proposal-button" href={`/proposals/${id}/edit`}><ButtonIcon kind="edit"/>Edit</Link><a className="proposal-button" href={`/api/proposals/${id}/pdf`}><ButtonIcon kind="download"/>Download Proposal PDF</a></div></div><div className="crm-form-panel"><h2>Proposal Details</h2><dl className="proposal-fields"><div><dt>Project Name</dt><dd>{project.name}</dd></div><div><dt>Contact</dt><dd>{project.contact||'—'}</dd></div><div><dt>Price</dt><dd>{money(project.price)}</dd></div><div><dt>Deposit</dt><dd>{money(depositAmount(project.price,proposal.deposit_percentage))}</dd></div><div><dt>Deposit Percentage</dt><dd>{proposal.deposit_percentage}%</dd></div></dl></div><section className="crm-form-panel proposal-view-media"><h2>Media</h2>{media.length?media.map(m=><figure key={m.id}>{m.title&&<figcaption>{m.title}</figcaption>}<Image unoptimized width={1000} height={700} src={`/api/proposals/${id}/media/${m.id}`} alt={m.title||m.filename}/></figure>):<p className="contact-help">No images added.</p>}</section></section>;
}

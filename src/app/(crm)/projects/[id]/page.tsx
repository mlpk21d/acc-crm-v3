import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/session";
import { can } from "@/features/auth/permissions";
import { getProject,checklistFields } from "@/features/projects/data";
import { listProjectRooms, manufacturerChoices } from "@/features/projects/rooms-data";
import { ProjectRooms } from "@/features/projects/project-rooms";
import { getProjectFinancials } from "@/features/projects/financial-data";
import { ProjectFinancialPanel } from "@/features/projects/project-financial-panel";

const labels:Record<(typeof checklistFields)[number],string>={
 drawing_approved:"Drawing Approved",appliance_specs:"Appliance Specs",ceiling_height:"Ceiling Height",
 floor_thickness:"Floor Thickness",hardware:"Hardware",door_styles:"Door Styles",finishes:"Finishes"
};
const display=(v:string|null|undefined)=>v?.trim()||"—";
const formatDate=(v:string|null|undefined)=>v?new Date(v+"T00:00:00").toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}):"—";
export default async function ProjectDetails({params}:{params:Promise<{id:string}>}) {
 const user=await requirePermission("projects:read");
 const {id}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id))notFound();
 const project=await getProject(id);
 if(!project)notFound();
 const [rooms,manufacturers]=await Promise.all([listProjectRooms(id),manufacturerChoices()]);
 const financials=user.role==="admin"?await getProjectFinancials(id):null;
 const details=[
  ["Address",project.project_address],["Designer",project.project_designer],["Current Status",project.status],
  ["Next Step",project.next_step],["Sample Signoff Status",project.sample_signoff_status],
  ["Order By Date",formatDate(project.order_by_date)],["Official Start Date",formatDate(project.official_start_date)],
  ["Install Date",formatDate(project.install_date)]
 ];
 return <section className="crm-project-page">
  <div className="page-heading crm-project-heading">
   <div><Link className="crm-project-back" href="/projects">← Back</Link><h1>{project.name}</h1></div>
   {can(user.role,"projects:write")&&<Link className="crm-project-edit-link" href={`/projects/${id}/edit`}>Edit Project</Link>}
  </div>
  <div className="crm-project-status">{project.status}</div>
  <section className="content-card crm-project-detail-card"><h2>Project Details</h2>
   <div className="crm-project-detail-grid">
    {details.map(([label,value])=><div key={label}><span className="crm-project-detail-label">{label}</span><p>{display(value)}</p></div>)}
    <div><span className="crm-project-detail-label">Contact</span>
     <p>{project.contact_id?<Link href={`/contacts/${project.contact_id}`}>{display(project.project_contact_name||project.contact_name)}</Link>:display(project.project_contact_name||project.contact_name)}</p>
     {project.project_contact_phone&&<a href={`tel:${project.project_contact_phone}`}>{project.project_contact_phone}</a>}
    </div>
   </div>
  </section>
  <div className="crm-project-three-panels">
   {financials?<ProjectFinancialPanel projectId={id} financials={financials.project} rooms={financials.rooms} roomNames={Object.fromEntries(rooms.map(r=>[r.id,r.room_name]))}/>:<section className="content-card"><h2>Project Information</h2><p>{display(project.description)}</p></section>}
   <section className="content-card"><h2>Notes</h2><p className="crm-project-notes-display">{display(project.notes)}</p></section>
   <section className="content-card"><h2>Checklist</h2><div className="crm-project-checklist">
    {checklistFields.map(key=><div className="crm-project-check-row" key={key}><input type="checkbox" checked={project.checklist[key]} disabled readOnly/><span>{labels[key]}</span></div>)}
   </div></section>
  </div>
  <section className="content-card crm-project-rooms"><ProjectRooms projectId={id} rooms={rooms} manufacturers={manufacturers} canEdit={can(user.role,"projects:write")} isAdmin={user.role==="admin"}/></section>
 </section>;
}

"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { saveProject } from "@/features/projects/actions";
import type { Project } from "@/features/projects/data";
const checklistFields=["drawing_approved","appliance_specs","ceiling_height","floor_thickness","hardware","door_styles","finishes"] as const;

const checklistLabels:Record<(typeof checklistFields)[number],string>={
 drawing_approved:"Drawing Approved",appliance_specs:"Appliance Specs",ceiling_height:"Ceiling Height",
 floor_thickness:"Floor Thickness",hardware:"Hardware",door_styles:"Door Styles",finishes:"Finishes"
};
export function ProjectForm({project,contacts,statuses,financialPanel}:{
 project?:Project;contacts:{id:string;label:string}[];
 statuses:{value:string;label:string;color:string|null}[]; financialPanel?:ReactNode;
}) {
 const [state,action,pending]=useActionState(saveProject,{error:null});
 const field=(name:keyof Project,label:string,type="text")=><label key={name}>{label}
   <input name={name} type={type} defaultValue={String(project?.[name]??"")} maxLength={type==="text"?500:undefined}/>
 </label>;
 return <div className="crm-project-edit-form">
  <form id="crm-project-core-form" action={action} className="crm-project-core-form">
  {project&&<input type="hidden" name="id" value={project.id}/>}
  {state.error&&<p role="alert" className="contact-form-error">{state.error}</p>}
  <section className="content-card crm-project-detail-card">
   <h2>Project Details</h2>
   <div className="crm-project-field-grid">
    <label>Project Name<input name="name" required maxLength={200} defaultValue={project?.name??""}/></label>
    {field("project_address","Address")}
    <label>Contact<select name="contact_id" defaultValue={project?.contact_id??""}><option value="">No contact</option>{contacts.map(c=><option value={c.id} key={c.id}>{c.label}</option>)}</select></label>
    {field("project_contact_name","Contact Name")}
    {field("project_contact_phone","Contact Phone")}
    {field("project_designer","Designer")}
    <label>Project Status<select name="status" defaultValue={project?.status??""} required><option value="">Select...</option>{statuses.map(s=><option value={s.value} key={s.value}>{s.label}</option>)}{project?.status&&!statuses.some(s=>s.value===project.status)&&<option value={project.status}>{project.status} (inactive)</option>}</select></label>
    {field("next_step","Next Step")}
    {field("sample_signoff_status","Sample Signoff Status")}
    {field("order_by_date","Order By Date","date")}
    {field("official_start_date","Official Start Date","date")}
    {field("install_date","Install Date","date")}
   </div>
   {financialPanel&&<label className="crm-project-description">Description<textarea name="description" rows={3} maxLength={10000} defaultValue={project?.description??""}/></label>}
  </section>
  </form>
  <div className="crm-project-three-panels">
   {financialPanel??<section className="content-card"><h2>Project Information</h2>
    <label>Description<textarea name="description" form="crm-project-core-form" rows={5} maxLength={10000} defaultValue={project?.description??""}/></label>
   </section>}
   <section className="content-card"><h2>Notes</h2><label className="crm-project-notes-label">Project Notes<textarea name="notes" form="crm-project-core-form" rows={12} maxLength={20000} defaultValue={project?.notes??""}/></label></section>
   <section className="content-card"><h2>Checklist</h2><div className="crm-project-checklist">{checklistFields.map(key=><label key={key}><input type="checkbox" form="crm-project-core-form" name={key} defaultChecked={project?.checklist?.[key]??false}/>{checklistLabels[key]}</label>)}</div></section>
  </div>
  <div className="contact-actions"><Link href={project?`/projects/${project.id}`:"/projects"}>Cancel</Link><button form="crm-project-core-form" disabled={pending} type="submit">{pending?"Saving…":project?"Save Changes":"Create Project"}</button></div>
 </div>;
}

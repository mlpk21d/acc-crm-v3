"use client";
import { ProjectRecordInfo } from "./project-record-info";
import { ButtonIcon } from "@/components/button-icon";
import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import { saveProject } from "@/features/projects/actions";
import type { Project } from "@/features/projects/data";
import { ProjectContactPicker } from "@/features/projects/project-contact-picker";
const checklistFields=["drawing_approved","appliance_specs","ceiling_height","floor_thickness","hardware","door_styles","finishes"] as const;

const checklistLabels:Record<(typeof checklistFields)[number],string>={
 drawing_approved:"Drawing Approved",appliance_specs:"Appliance Specs",ceiling_height:"Ceiling Height",
 floor_thickness:"Floor Thickness",hardware:"Hardware",door_styles:"Door Styles",finishes:"Finishes"
};
export function ProjectForm({project,contacts,statuses,financialPanel,initialRoomsPanel}:{
 project?:Project;contacts:{id:string;label:string;phone:string|null;company:string|null}[];
 statuses:{value:string;label:string;color:string|null}[]; financialPanel?:ReactNode; initialRoomsPanel?:ReactNode;
}) {
 const [state,action,pending]=useActionState(saveProject,{error:null});
 const [values,setValues]=useState({status:project?.status??"",next_step:project?.next_step??""});
 const [custom,setCustom]=useState<"status"|"next_step"|null>(null);
 const [customValue,setCustomValue]=useState("");
 const [customFlags,setCustomFlags]=useState({status:false,next_step:false});
 const options=(value:string)=>statuses.some(s=>s.value===value);
 const choose=(field:"status"|"next_step",value:string)=>{if(value==="__custom__"){setCustom(field);setCustomValue("");return;}setValues(old=>({...old,[field]:value}));setCustomFlags(old=>({...old,[field]:false}));};
 const applyCustom=()=>{const value=customValue.trim();if(!custom||!value||value.length>100)return;setValues(old=>({...old,[custom]:value}));setCustomFlags(old=>({...old,[custom]:true}));setCustom(null);};
 const statusField=(field:"status"|"next_step",label:string)=><label>{label}<select name={field} value={values[field]} required={field==="status"} onChange={e=>choose(field,e.target.value)}><option value="">Select...</option>{statuses.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}{values[field]&&!options(values[field])&&<option value={values[field]}>{values[field]} (Custom)</option>}<option value="__custom__">Custom...</option></select><input type="hidden" name={`${field}_custom`} value={customFlags[field]?"true":"false"}/></label>;
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
    <label className="crm-project-name-field">Project Name<input name="name" required maxLength={200} defaultValue={project?.name??""}/></label>
    {field("project_address","Project Address")}
    {field("project_designer","Designer")}

    {statusField("status","Project Status")}
    {statusField("next_step","Next Step")}
    <label>Sample Signoff Status<select name="sample_signoff_status" defaultValue={project?.sample_signoff_status??""}><option value="">Select...</option><option value="Pending">Pending</option><option value="Approved">Approved</option></select></label>
    <ProjectContactPicker contacts={contacts} initialId={project?.contact_id??""} initialName={project?.project_contact_name||contacts.find(c=>c.id===project?.contact_id)?.label||""} initialPhone={project?.project_contact_phone||project?.contact_phone||""}/>
    {field("order_by_date","Order By Date","date")}
    {field("official_start_date","Official Start Date","date")}
    {field("install_date","Install Date","date")}
   </div>

  </section>
  </form>
  <div className="crm-project-three-panels">
   {financialPanel??<section className="content-card"><h2>Project Information</h2><p>Project details are saved with this form.</p></section>}
   <section className="content-card"><h2>Notes</h2><label className="crm-project-notes-label">Project Notes<textarea name="notes" form="crm-project-core-form" rows={12} maxLength={20000} defaultValue={project?.notes??""}/></label></section>
   <section className="content-card"><h2>Checklist</h2><div className="crm-project-checklist">{checklistFields.map(key=><label key={key}><input type="checkbox" form="crm-project-core-form" name={key} defaultChecked={project?.checklist?.[key]??false}/>{checklistLabels[key]}</label>)}</div></section>
  </div>
  {initialRoomsPanel}
  {project&&<ProjectRecordInfo key={`${project.created_at}-${project.updated_at}`} created={project.created_at} updated={project.updated_at} editable/>}
  {custom&&<div className="crm-room-modal-layer"><button type="button" className="crm-room-modal-backdrop" aria-label="Close custom value dialog" onClick={()=>setCustom(null)}><ButtonIcon kind="close" /></button><div role="dialog" aria-modal="true" aria-labelledby="crm-custom-value-title" className="crm-room-modal crm-project-custom-modal"><div className="crm-room-modal-title"><h2 id="crm-custom-value-title">Add Custom {custom==="status"?"Project Status":"Next Step"}</h2><button type="button" onClick={()=>setCustom(null)} aria-label="Close"><ButtonIcon kind="close" /></button></div><div className="crm-project-custom-body"><label>{custom==="status"?"Project Status":"Next Step"}<input autoFocus maxLength={100} value={customValue} onChange={e=>setCustomValue(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();applyCustom();}if(e.key==="Escape")setCustom(null);}}/></label><div className="crm-room-modal-actions"><button type="button" onClick={()=>setCustom(null)}>Cancel<ButtonIcon kind="close" /></button><button type="button" disabled={!customValue.trim()} onClick={applyCustom}>Add Custom<ButtonIcon kind="add" /></button></div></div></div></div>}
  <div className="contact-actions crm-project-form-actions"><Link href={project?`/projects/${project.id}`:"/projects"}><ButtonIcon kind="close"/>Cancel</Link><button form="crm-project-core-form" disabled={pending} type="submit">{pending?"Saving…":project?"Save Changes":"Create Project"}<ButtonIcon kind="save" /></button></div>
 </div>;
}

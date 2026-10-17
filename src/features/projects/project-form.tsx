"use client";
import Link from "next/link";
import { useActionState } from "react";
import { saveProject } from "@/features/projects/actions";
import type { Project } from "@/features/projects/data";

export function ProjectForm({ project, contacts, statuses }: {
  project?: Project; contacts: {id:string;label:string}[];
  statuses: {value:string;label:string;color:string|null}[];
}) {
  const [state, action, pending] = useActionState(saveProject, {error:null});
  return <form action={action} className="content-card contact-form">
    {project && <input type="hidden" name="id" value={project.id}/>}
    {state.error && <p role="alert" className="contact-form-error">{state.error}</p>}
    <label>Project name<input name="name" required maxLength={200} defaultValue={project?.name??""}/></label>
    <label>Contact<select name="contact_id" defaultValue={project?.contact_id??""}>
      <option value="">No contact</option>
      {contacts.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
    </select></label>
    <label>Project Status<select name="status" defaultValue={project?.status??""} required>
      <option value="">Select...</option>
      {statuses.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
      {project?.status && !statuses.some(s=>s.value===project.status) && <option value={project.status}>{project.status} (inactive)</option>}
    </select></label>
    <label>Description<textarea name="description" rows={5} maxLength={10000} defaultValue={project?.description??""}/></label>
    <div className="contact-actions"><button disabled={pending} type="submit">{pending?"Saving…":"Save project"}</button><Link href="/projects">Cancel</Link></div>
  </form>;
}

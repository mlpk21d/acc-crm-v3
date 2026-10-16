"use client";
import Link from "next/link";
import { useActionState } from "react";
import { saveProject } from "@/features/projects/actions";
import type { Project } from "@/features/projects/data";

export function ProjectForm({ project, contacts }: {
  project?: Project; contacts: {id:string;label:string}[];
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
    <label>Status<select name="status" defaultValue={project?.status??"planned"}>
      {["planned","active","on_hold","completed","cancelled"].map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}
    </select></label>
    <label>Description<textarea name="description" rows={5} maxLength={10000} defaultValue={project?.description??""}/></label>
    <div className="contact-actions"><button disabled={pending} type="submit">{pending?"Saving…":"Save project"}</button><Link href="/projects">Cancel</Link></div>
  </form>;
}

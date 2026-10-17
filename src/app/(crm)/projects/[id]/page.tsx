import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/session";
import { can } from "@/features/auth/permissions";
import { getProject } from "@/features/projects/data";
import { listProjectRooms, manufacturerChoices } from "@/features/projects/rooms-data";
import { ProjectRooms } from "@/features/projects/project-rooms";
export default async function ProjectDetails({params}:{params:Promise<{id:string}>}) {
 const user=await requirePermission("projects:read");
 const {id}=await params;
 if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) notFound();
 const project=await getProject(id);
 if(!project) notFound();
 const [rooms,manufacturers]=await Promise.all([listProjectRooms(id),manufacturerChoices()]);
 return <section><div className="page-heading"><div><h1>{project.name}</h1><p>Status: {project.status.replaceAll("_"," ")}</p></div>
 {can(user.role,"projects:write") && <Link href={`/projects/${id}/edit`}>Edit project</Link>}</div>
 <div className="content-card"><p>Contact: {project.contact_id?<Link href={`/contacts/${project.contact_id}`}>{project.contact_name??"Contact"}</Link>:"—"}</p>
 <p>Description: {project.description??"—"}</p></div>
 <section className="content-card crm-project-rooms"><ProjectRooms projectId={id} rooms={rooms} manufacturers={manufacturers} canEdit={can(user.role,"projects:write")}/></section>
 <div className="contact-actions"><Link href="/projects">Back to projects</Link></div>
 </section>;
}

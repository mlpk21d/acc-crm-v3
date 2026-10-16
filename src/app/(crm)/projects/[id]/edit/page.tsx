import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/session";
import { getProject, contactChoices } from "@/features/projects/data";
import { ProjectForm } from "@/features/projects/project-form";
export default async function EditProject({params}:{params:Promise<{id:string}>}) {
 await requirePermission("projects:write");
 const {id}=await params;
 if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) notFound();
 const project=await getProject(id);
 if(!project) notFound();
 return <section><div className="page-heading"><h1>Edit project</h1></div>
 <ProjectForm project={project} contacts={await contactChoices()}/></section>;
}

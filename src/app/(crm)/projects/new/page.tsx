import { requirePermission } from "@/features/auth/session";
import { contactChoices } from "@/features/projects/data";
import { ProjectForm } from "@/features/projects/project-form";
export default async function NewProject() {
  await requirePermission("projects:write");
  return <section><div className="page-heading"><h1>New project</h1></div><ProjectForm contacts={await contactChoices()}/></section>;
}

import { requirePermission } from "@/features/auth/session";
import { contactChoices, projectStatusOptions } from "@/features/projects/data";
import { ProjectForm } from "@/features/projects/project-form";
import { NewProjectFinancialFields } from "@/features/projects/new-project-financial-fields";
export default async function NewProject() {
  const user=await requirePermission("projects:write");
  return <section><div className="page-heading"><h1>New project</h1></div><ProjectForm contacts={await contactChoices()} statuses={await projectStatusOptions()} financialPanel={user.role==="admin"?<NewProjectFinancialFields/>:undefined}/></section>;
}

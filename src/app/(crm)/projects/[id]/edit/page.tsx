import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/session";
import { getProject, contactChoices, projectStatusOptions } from "@/features/projects/data";
import { ProjectForm } from "@/features/projects/project-form";
import { getProjectFinancials } from "@/features/projects/financial-data";
import { ProjectFinancialPanel } from "@/features/projects/project-financial-panel";
import { listProjectRooms } from "@/features/projects/rooms-data";
export default async function EditProject({params}:{params:Promise<{id:string}>}) {
 const user=await requirePermission("projects:write");
 const {id}=await params;
 if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) notFound();
 const project=await getProject(id);
 if(!project) notFound();
 const financials=user.role==="admin"?await getProjectFinancials(id):null;
 const rooms=financials?await listProjectRooms(id):[];
 return <section><div className="page-heading"><h1>Edit project</h1></div>
 <ProjectForm project={project} contacts={await contactChoices()} statuses={await projectStatusOptions()}
 financialPanel={financials?<ProjectFinancialPanel projectId={id} financials={financials.project} rooms={financials.rooms} roomNames={Object.fromEntries(rooms.map(r=>[r.id,r.room_name]))}/>:undefined}/></section>;
}

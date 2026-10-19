import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/session";
import { getProject, contactChoices, projectStatusOptions } from "@/features/projects/data";
import { ProjectForm } from "@/features/projects/project-form";
import { getProjectFinancials } from "@/features/projects/financial-data";
import { ProjectFinancialPanel } from "@/features/projects/project-financial-panel";
import { listProjectRooms, manufacturerChoices } from "@/features/projects/rooms-data";
import { ProjectRooms } from "@/features/projects/project-rooms";
export default async function EditProject({params}:{params:Promise<{id:string}>}) {
 const user=await requirePermission("projects:write");
 const {id}=await params;
 if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) notFound();
 const project=await getProject(id);
 if(!project) notFound();
 const financials=user.role==="admin"?await getProjectFinancials(id):null;
 const [rooms,manufacturers]=await Promise.all([listProjectRooms(id),manufacturerChoices()]);
 return <section><div className="page-heading"><h1>Edit project</h1></div>
 <ProjectForm project={project} contacts={await contactChoices()} statuses={await projectStatusOptions()}
 financialPanel={financials?<ProjectFinancialPanel editable projectId={id} financials={financials.project} rooms={financials.rooms} roomNames={Object.fromEntries(rooms.map(r=>[r.id,r.room_name]))}/>:undefined}
 initialRoomsPanel={<section className="content-card crm-project-rooms"><ProjectRooms projectId={id} rooms={rooms} manufacturers={manufacturers} canEdit isAdmin={user.role==="admin"}/></section>}/></section>;
}

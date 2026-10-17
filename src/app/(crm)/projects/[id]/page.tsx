import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/session";
import { can } from "@/features/auth/permissions";
import { getProject } from "@/features/projects/data";
import { listProjectRooms, manufacturerChoices } from "@/features/projects/rooms-data";
import { addProjectRoom } from "@/features/projects/rooms-actions";
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
 <section className="content-card crm-project-rooms">
 <h2>Rooms</h2>
 <div className="crm-rooms-scroll"><table className="contact-table"><thead><tr><th>Room</th><th>Door Style</th><th>Drawer Style</th><th>Species</th><th>Finish</th><th>Construction</th><th>Manufacturer</th></tr></thead><tbody>
 {rooms.map(room=><tr key={room.id}><td>{room.room_name}</td><td>{room.door_style??"—"}</td><td>{room.drawer_style??"—"}</td><td>{room.species??"—"}</td><td>{room.finish??"—"}</td><td>{room.construction??"—"}</td><td><span className="crm-manufacturer-chip" style={{backgroundColor:/^#[0-9a-f]{6}$/i.test(room.manufacturer_color??"")?room.manufacturer_color??undefined:undefined}}>{room.manufacturer??"—"}</span></td></tr>)}
 </tbody></table></div>
 {rooms.length===0&&<p>No rooms added yet.</p>}
 {can(user.role,"projects:write")&&<details className="crm-room-add"><summary>Add Room</summary>
 <form action={addProjectRoom} className="crm-room-fields">
 <input type="hidden" name="project_id" value={id}/>
 {([["room_name","Room Name"],["door_style","Door Style"],["drawer_style","Drawer Style"],["species","Species"],["finish","Finish"]] as const).map(([name,label])=><label key={name}>{label}<input name={name} maxLength={200} required={name==="room_name"}/></label>)}
 <label>Construction<select name="construction"><option value="">Select...</option>{["Inset","Inset Beaded","Full Overlay","Frameless"].map(c=><option key={c} value={c}>{c}</option>)}</select></label>
 <label>Manufacturer<select name="manufacturer"><option value="">Select...</option>{manufacturers.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
 <button type="submit">Save Room</button>
 </form></details>}
 </section>
 <div className="contact-actions"><Link href="/projects">Back to projects</Link></div>
 </section>;
}

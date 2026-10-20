import { ButtonIcon } from "@/components/button-icon";
import Link from "next/link";
import { can } from "@/features/auth/permissions";
import { requirePermission } from "@/features/auth/session";
import { listProjects } from "@/features/projects/data";

export default async function ProjectsPage({searchParams}:{
  searchParams:Promise<{q?:string;page?:string}>
}) {
  const user=await requirePermission("projects:read");
  const {q="",page:rawPage="1"}=await searchParams;
  const page=Math.max(1,Math.min(10000,Number.parseInt(rawPage,10)||1));
  const search=q.slice(0,100);
  const {rows,hasNext}=await listProjects(search,page);
  return <section>
    <div className="page-heading"><div><h1>Projects</h1><p>Project records and associated contacts.</p></div>
      {can(user.role,"projects:write")&&<Link href="/projects/new">Add project</Link>}</div>
    <form method="get" className="contact-search">
      <label htmlFor="project-search">Search projects</label>
      <input id="project-search" name="q" maxLength={100} defaultValue={search}/>
      <button type="submit">Search<ButtonIcon kind="search" /></button>
    </form>
    <div className="content-card"><table className="contact-table">
      <thead><tr><th>Project</th><th>Contact</th><th>Status</th></tr></thead>
      <tbody>{rows.map(project=><tr key={project.id}>
        <td><Link href={`/projects/${project.id}`}>{project.name}</Link></td>
        <td>{project.contact_name??"—"}</td><td>{project.status.replaceAll("_"," ")}</td>
      </tr>)}</tbody></table>{rows.length===0&&<p>No projects found.</p>}</div>
    <nav className="contact-actions" aria-label="Projects pagination">
      {page>1&&<Link href={`/projects?q=${encodeURIComponent(search)}&page=${page-1}`}>Previous</Link>}
      <span>Page {page}</span>
      {hasNext&&<Link href={`/projects?q=${encodeURIComponent(search)}&page=${page+1}`}>Next</Link>}
    </nav>
  </section>;
}

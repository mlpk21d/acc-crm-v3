import "server-only";
import { getDbPool } from "@/lib/db";

export const checklistFields = ["drawing_approved","appliance_specs","ceiling_height","floor_thickness","hardware","door_styles","finishes"] as const;
export type ProjectChecklist=Record<(typeof checklistFields)[number],boolean>;
export type Project = {
  created_at: string; updated_at: string;
  id: string; name: string; contact_id: string | null; contact_name: string | null;
  contact_phone:string|null;contact_company:string|null;
  status: string;status_color:string|null;
  description: string | null;
  project_address:string|null;project_contact_name:string|null;project_contact_phone:string|null;project_designer:string|null;
  next_step:string|null;sample_signoff_status:string|null;order_by_date:string|null;official_start_date:string|null;install_date:string|null;notes:string|null;
  checklist:ProjectChecklist;
};
const selection = `SELECT p.id, p.name, p.contact_id, p.status, s.color AS status_color, p.description,
 to_char(p.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at,
 to_char(p.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS updated_at,
 p.project_address,p.project_contact_name,p.project_contact_phone,p.project_designer,p.next_step,p.sample_signoff_status,
 p.order_by_date::text,p.official_start_date::text,p.install_date::text,p.notes,
 c.phone AS contact_phone,c.company_name AS contact_company,
  COALESCE(NULLIF(trim(concat_ws(' ', c.first_name, c.last_name)), ''), c.company_name) AS contact_name
  FROM public.projects p LEFT JOIN public.contacts c ON c.id = p.contact_id
 LEFT JOIN public.crm_settings_options s ON s.category='project_status' AND s.value=p.status`;
export async function listProjects(search: string, page: number) {
  const result = await getDbPool().query<Project>(
    `${selection} WHERE p.deleted_at IS NULL AND ($1 = '' OR p.name ILIKE '%' || $1 || '%')
     ORDER BY p.created_at DESC, p.id DESC LIMIT 26 OFFSET $2`,
    [search.trim().slice(0,100), (page-1)*25],
  );
  return { rows: result.rows.slice(0,25), hasNext: result.rows.length > 25 };
}
export async function getProject(id: string) {
  const result = await getDbPool().query<Project>(`${selection} WHERE p.id=$1 AND p.deleted_at IS NULL`, [id]);
  const project=result.rows[0];
  if(!project)return null;
  const checklist=await getDbPool().query<ProjectChecklist>(
   "SELECT drawing_approved,appliance_specs,ceiling_height,floor_thickness,hardware,door_styles,finishes FROM public.project_checklist WHERE project_id=$1",[id]);
  project.checklist=checklist.rows[0]??Object.fromEntries(checklistFields.map(k=>[k,false])) as ProjectChecklist;
  return project;
}
export async function contactChoices() {
  const result = await getDbPool().query<{id:string; label:string;phone:string|null;company:string|null}>(`
    SELECT id, phone, company_name AS company, COALESCE(NULLIF(trim(concat_ws(' ',first_name,last_name)),''), company_name) AS label
    FROM public.contacts WHERE deleted_at IS NULL ORDER BY label, id LIMIT 500`);
  return result.rows;
}

export async function projectStatusOptions() {
  const result = await getDbPool().query<{value:string;label:string;color:string|null}>(
    "SELECT value,label,color FROM public.crm_settings_options WHERE category='project_status' AND active=true ORDER BY sort_order,label"
  );
  return result.rows;
}

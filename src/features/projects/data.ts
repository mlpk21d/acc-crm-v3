import "server-only";
import { getDbPool } from "@/lib/db";

export type Project = {
  id: string; name: string; contact_id: string | null; contact_name: string | null;
  status: "planned" | "active" | "on_hold" | "completed" | "cancelled";
  description: string | null;
};
const selection = `SELECT p.id, p.name, p.contact_id, p.status, p.description,
  COALESCE(NULLIF(trim(concat_ws(' ', c.first_name, c.last_name)), ''), c.company_name) AS contact_name
  FROM public.projects p LEFT JOIN public.contacts c ON c.id = p.contact_id`;
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
  return result.rows[0] ?? null;
}
export async function contactChoices() {
  const result = await getDbPool().query<{id:string; label:string}>(`
    SELECT id, COALESCE(NULLIF(trim(concat_ws(' ',first_name,last_name)),''), company_name) AS label
    FROM public.contacts WHERE deleted_at IS NULL ORDER BY label, id LIMIT 500`);
  return result.rows;
}

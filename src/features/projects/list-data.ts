import 'server-only';
import {getDbPool} from '@/lib/db';
import {requirePermission} from '@/features/auth/session';
import {can} from '@/features/auth/permissions';
import {allowedColumns,defaultHidden,type ProjectColumn,type ProjectListFilters,type ProjectListResult,type ProjectListRow} from './list-model';

export async function getProjectList(input:ProjectListFilters):Promise<ProjectListResult>{
 const user=await requirePermission('projects:read');
 const admin=can(user.role,'settings:manage');
 const page=Math.max(1,Math.min(10000,Math.trunc(Number(input.page))||1));
 const sort=allowedColumns(admin).some(([k])=>k===input.sort)?input.sort:'updated_at';
 const direction=input.direction==='asc'?'ASC':'DESC';
 const q=String(input.q??'').trim().slice(0,100).replace(/[\\%_]/g,'\\$&');
 const params=[q,String(input.status??'').slice(0,100),input.featured===true];
 const where=`p.deleted_at IS NULL AND ($1='' OR p.name ILIKE '%' || $1 || '%')
 AND (($2<>'' AND p.status=$2) OR ($2='' AND lower(p.status) NOT IN ('canceled','cancelled','archived')))
 AND (NOT $3::boolean OR p.featured)`;
 // Only administrators query financial tables. Round each discounted room in cents, as on Project View.
 const finance=admin?`, amounts AS (
 SELECT p.id,COALESCE((SELECT SUM(ROUND(COALESCE(rf.room_cost,0)*100*(1-COALESCE(rf.manufacturer_discount,0)/100)))
 FROM public.project_rooms r LEFT JOIN public.project_room_financials rf ON rf.room_id=r.id WHERE r.project_id=p.id AND r.enabled=true),0)
 +100*(COALESCE(f.install_cost,0)+COALESCE(f.misc_cost,0)+COALESCE(f.drawing_cost,0)+COALESCE(f.freight,0)+COALESCE(f.doors_pulls,0)) AS base,
 CASE WHEN f.margin_type='other' THEN f.custom_margin WHEN f.margin_type='25' THEN 0.25 ELSE 0.35 END AS margin
 FROM public.projects p LEFT JOIN public.project_financials f ON f.project_id=p.id WHERE ${where})`:'';
 const selection=`WITH marker AS (SELECT 1) ${finance}, listed AS (
 SELECT p.id,p.name AS project_name,p.status AS project_status,COALESCE(s.label,p.status) AS status_label,s.color AS status_color,
 p.next_step,p.order_by_date::text,p.official_start_date::text,p.install_date::text,p.sample_signoff_status AS sample_signoff,
 COALESCE(ch.drawing_approved,false) AS drawing_approved,
 COALESCE(NULLIF(trim(concat_ws(' ',c.first_name,c.last_name)),''),c.company_name,NULLIF(p.project_contact_name,'')) AS contact,
 p.featured,p.updated_at ${admin?',ROUND(a.base/(1-a.margin))/100 AS total_cost,(ROUND(a.base/(1-a.margin))-a.base)/100 AS profit':''}
 FROM public.projects p LEFT JOIN public.contacts c ON c.id=p.contact_id
 LEFT JOIN public.project_checklist ch ON ch.project_id=p.id
 LEFT JOIN public.crm_settings_options s ON s.category='project_status' AND s.value=p.status
 ${admin?'LEFT JOIN amounts a ON a.id=p.id':''} WHERE ${where})
 SELECT * FROM listed ORDER BY ${sort} ${direction} NULLS LAST,id ${direction} LIMIT 15 OFFSET $4`;
 const [result,count]=await Promise.all([
 getDbPool().query<ProjectListRow>(selection,[...params,(page-1)*15]),
 getDbPool().query<{total:string}>(`SELECT count(*)::text AS total FROM public.projects p WHERE ${where}`,params)]);
 return {rows:result.rows.map(r=>({...r,updated_at:new Date(r.updated_at).toISOString()})),total:Number(count.rows[0].total)};
}
export async function getProjectListColumns():Promise<ProjectColumn[]>{
 const user=await requirePermission('projects:read');
 const result=await getDbPool().query<{hidden_columns:ProjectColumn[]}>('SELECT hidden_columns FROM public.user_project_list_columns WHERE user_id=$1',[user.id]);
 return (result.rows[0]?.hidden_columns??defaultHidden).filter(key=>key!=='project_name');
}

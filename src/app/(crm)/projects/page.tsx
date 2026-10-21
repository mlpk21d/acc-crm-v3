import {can} from '@/features/auth/permissions';
import {requirePermission} from '@/features/auth/session';
import {projectStatusOptions} from '@/features/projects/data';
import {getProjectList,getProjectListColumns} from '@/features/projects/list-data';
import {defaultFilters} from '@/features/projects/list-model';
import {ProjectList} from '@/features/projects/project-list';
export default async function ProjectsPage({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}){
 const user=await requirePermission('projects:read');
 const params=await searchParams;
 const filters={...defaultFilters,q:(params.q??'').slice(0,100),page:Math.max(1,Math.min(10000,Number.parseInt(params.page??'1',10)||1))};
 const [initial,hiddenColumns,statuses]=await Promise.all([getProjectList(filters),getProjectListColumns(),projectStatusOptions()]);
 return <ProjectList initial={initial} initialFilters={filters} hiddenColumns={hiddenColumns} statuses={statuses} admin={can(user.role,'settings:manage')} editable={can(user.role,'projects:write')}/>;
}

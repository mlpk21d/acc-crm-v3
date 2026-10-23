'use server';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {requirePermission} from '@/features/auth/session';
import {getDbPool} from '@/lib/db';
import {getProjectList} from './list-data';
import {projectColumns,type ProjectListFilters,type ProjectColumn} from './list-model';
export async function searchProjects(filters:ProjectListFilters){return getProjectList(filters);}
export async function setProjectFeatured(id:string,featured:boolean){
 const user=await requirePermission('projects:write');
 if(!z.uuid().safeParse(id).success||typeof featured!=='boolean')return {error:'Invalid project.'};
 try{
 const result=await getDbPool().query('UPDATE public.projects SET featured=$2,updated_by=$3,updated_at=now() WHERE id=$1 AND deleted_at IS NULL RETURNING id',[id,featured,user.id]);
 if(!result.rowCount)return {error:'Project no longer exists.'};
 revalidatePath('/projects');revalidatePath('/');revalidatePath(`/projects/${id}`);revalidatePath(`/projects/${id}/edit`);
 return {error:null};
 }catch{return {error:'Unable to update featured project. Please try again.'};}
}
export async function saveProjectListColumns(hidden:ProjectColumn[]){
 const user=await requirePermission('projects:read');
 if(!Array.isArray(hidden)||hidden.length>projectColumns.length||hidden.some(k=>!projectColumns.some(([key])=>key===k)))return {error:'Invalid columns.'};
 try{await getDbPool().query(`INSERT INTO public.user_project_list_columns(user_id,hidden_columns) VALUES($1,$2)
 ON CONFLICT(user_id) DO UPDATE SET hidden_columns=EXCLUDED.hidden_columns,updated_at=now()`,[user.id,[...new Set(hidden)].filter(key=>key!=='project_name')]);return {error:null};}
 catch{return {error:'Unable to save column preferences. Please try again.'};}
}

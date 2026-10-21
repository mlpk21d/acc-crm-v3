"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { searchJkPriceItems, getJkRoomConfig, listJkSeries, listJkCatalog } from "@/features/projects/jk-data";
import { z } from "zod";
import {configSchema,persistJkConfiguration} from "@/features/projects/jk-persistence";

export async function saveJkConfiguration(input:unknown) {
 await requirePermission("settings:manage"); // admin-only financial permissions
 const v=configSchema.parse(input);
 const client=await getDbPool().connect();
 try {
  await client.query("BEGIN");
  const result=await persistJkConfiguration(client,v);
  await client.query("COMMIT");
  revalidatePath("/projects/"+v.projectId);
  revalidatePath("/projects/"+v.projectId+"/edit");
  revalidatePath("/projects");
  return result;
 }catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
}

export async function searchJkCatalogAction(term:string,series:string) {
 await requirePermission("settings:manage");
 return searchJkPriceItems(term,series);
}
export async function loadJkSeriesAction(){
 await requirePermission("settings:manage");
 return listJkSeries();
}
export async function loadJkConfigAction(projectId:string,roomId:string) {
 await requirePermission("settings:manage");
 const project=z.uuid().parse(projectId),room=z.uuid().parse(roomId);
 const match=await getDbPool().query("SELECT 1 FROM public.project_rooms r JOIN public.projects p ON p.id=r.project_id WHERE r.id=$1 AND r.project_id=$2 AND r.manufacturer='J&K' AND p.deleted_at IS NULL",[room,project]);
 if(!match.rowCount) throw new Error("J&K room not found.");
 return getJkRoomConfig(room);
}

export async function loadJkCatalogAction(){
 await requirePermission("settings:manage");
 return listJkCatalog();
}

"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { parseProjectForm } from "@/features/projects/validation";
import { checklistFields } from "@/features/projects/data";
import { can } from "@/features/auth/permissions";

export type ProjectFormState = { error: string | null };
export async function saveProject(_state: ProjectFormState, form: FormData): Promise<ProjectFormState> {
  const user = await requirePermission("projects:write");
  const parsed = parseProjectForm(form);
  if (!parsed.success) return { error: parsed.error.issues.map(i=>i.message).join("; ") };
  const rawId = form.get("id");
  const id = typeof rawId === "string" && z.uuid().safeParse(rawId).success ? rawId : null;
  if (rawId && !id) return { error: "Invalid project identifier." };
  const {name,contact_id,status,description} = parsed.data;
  const pool = getDbPool();
  const extra=[parsed.data.project_address,parsed.data.project_contact_name,parsed.data.project_contact_phone,parsed.data.project_designer,parsed.data.next_step,parsed.data.sample_signoff_status,parsed.data.order_by_date||null,parsed.data.official_start_date||null,parsed.data.install_date||null,parsed.data.notes];
  const checklist=checklistFields.map(key=>form.get(key)==="on");
  const financeKeys=["install_cost","misc_cost","drawing_cost","freight","doors_pulls","margin_type","custom_margin_percent"];
  const hasFinance=financeKeys.some(k=>form.has(k));
  if(hasFinance&&!can(user.role,"settings:manage"))return {error:"Administrator access required for financial data."};
  const money=z.coerce.number().finite().min(0).max(99999999)
    .refine(v=>Math.abs(v*100-Math.round(v*100))<0.000001);
  const financeSchema=z.object({
    install_cost:money,misc_cost:money,drawing_cost:money,freight:money,doors_pulls:money,
    margin_type:z.enum(["25","35","other"]),
    custom_margin_percent:z.coerce.number().finite().min(0).max(99).optional()
  }).refine(v=>v.margin_type!=="other"||v.custom_margin_percent!==undefined);
  const finance=hasFinance?financeSchema.safeParse(Object.fromEntries(
    financeKeys.filter(k=>form.has(k)).map(k=>[k,form.get(k)]))):null;
  if(finance&&!finance.success)return {error:"Invalid financial values."};
  const roomSchema=z.object({
    room_name:z.string().trim().min(1).max(200),door_style:z.string().trim().max(200),
    drawer_style:z.string().trim().max(200),species:z.string().trim().max(200),
    finish:z.string().trim().max(200),construction:z.string().trim().max(200),
    manufacturer:z.string().trim().max(100),
    room_cost:money,manufacturer_discount:z.coerce.number().finite().min(0).max(100),
    ras_items:z.array(z.object({item_name:z.string().trim().min(1).max(200),
      code:z.string().trim().max(100),link:z.union([z.literal(""),z.url().refine(u=>u.startsWith("https://")||u.startsWith("http://"))])})).max(100)
  });
  let initialRooms:z.infer<typeof roomSchema>[]=[];
  if(form.has("initial_rooms")){
    if(id)return {error:"Initial rooms may only be submitted when creating a project."};
    try {
      const raw=form.get("initial_rooms");
      if(typeof raw!=="string"||raw.length>200000)throw new Error("Invalid rooms");
      const parsedRooms=z.array(roomSchema).max(100).safeParse(JSON.parse(raw));
      if(!parsedRooms.success)return {error:"Invalid room details."};
      initialRooms=parsedRooms.data;
    }catch{return {error:"Invalid rooms payload."};}
    if(!can(user.role,"settings:manage")&&initialRooms.some(r=>r.room_cost!==0||r.manufacturer_discount!==0))
      return {error:"Room financial fields require administrator access."};
  }
  let saved: string;
  const client=await pool.connect();
  try {
    await client.query("BEGIN");
    const allowedStatus = await client.query(
      "SELECT 1 FROM public.crm_settings_options WHERE category = $1 AND value = $2 AND active = true LIMIT 1",
      ["project_status", status],
    );
    if (!allowedStatus.rowCount) {
      const unchanged = id ? await client.query(
        "SELECT 1 FROM public.projects WHERE id=$1 AND status=$2 AND deleted_at IS NULL",
        [id, status],
      ) : null;
      if (!unchanged?.rowCount) {await client.query("ROLLBACK");return { error: "Choose an active Project Status from Settings." };}
    }
    if (contact_id) {
      const valid = await client.query("SELECT 1 FROM public.contacts WHERE id=$1 AND deleted_at IS NULL", [contact_id]);
      if (!valid.rowCount) {await client.query("ROLLBACK");return {error:"Choose an active contact."};}
    }
    if (id) {
      const updated = await client.query<{id:string}>(`UPDATE public.projects SET name=$1,contact_id=$2,status=$3,description=$4,
        updated_by=$5,updated_at=now(),project_address=$7,project_contact_name=$8,project_contact_phone=$9,project_designer=$10,next_step=$11,sample_signoff_status=$12,order_by_date=$13,official_start_date=$14,install_date=$15,notes=$16 WHERE id=$6 AND deleted_at IS NULL RETURNING id`,
        [name, contact_id||null,status,description||null,user.id,id,...extra]);
      if (!updated.rows[0]) {await client.query("ROLLBACK");return {error:"Project not found."};}
      saved = updated.rows[0].id;
    } else {
      const inserted = await client.query<{id:string}>(`INSERT INTO public.projects
        (name,contact_id,status,description,created_by,updated_by,project_address,project_contact_name,project_contact_phone,project_designer,next_step,sample_signoff_status,order_by_date,official_start_date,install_date,notes)
        VALUES($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
        [name,contact_id||null,status,description||null,user.id,...extra]);
      saved = inserted.rows[0].id;
    }
    if(finance?.success){
      const v=finance.data;
      await client.query(`INSERT INTO public.project_financials
      (project_id,install_cost,misc_cost,drawing_cost,freight,doors_pulls,margin_type,custom_margin)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT(project_id) DO UPDATE SET
      install_cost=excluded.install_cost,misc_cost=excluded.misc_cost,drawing_cost=excluded.drawing_cost,
      freight=excluded.freight,doors_pulls=excluded.doors_pulls,margin_type=excluded.margin_type,
      custom_margin=excluded.custom_margin,updated_at=now()`,
      [saved,v.install_cost,v.misc_cost,v.drawing_cost,v.freight,v.doors_pulls,
       v.margin_type,v.margin_type==="other"?(v.custom_margin_percent??0)/100:0]);
    }
    await client.query(`INSERT INTO public.project_checklist (project_id,drawing_approved,appliance_specs,ceiling_height,floor_thickness,hardware,door_styles,finishes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(project_id) DO UPDATE SET drawing_approved=$2,appliance_specs=$3,ceiling_height=$4,floor_thickness=$5,hardware=$6,door_styles=$7,finishes=$8,updated_at=now()`,[saved,...checklist]);
    if(initialRooms.length){
      const allowed=await client.query<{value:string}>(
        "SELECT value FROM public.crm_settings_options WHERE category='manufacturer' AND active=true");
      const choices=new Set(allowed.rows.map(row=>row.value));
      for(let i=0;i<initialRooms.length;i++){
        const r=initialRooms[i];
        if(r.manufacturer&&!choices.has(r.manufacturer))throw new Error("Invalid room manufacturer.");
        const created=await client.query<{id:string}>(`INSERT INTO public.project_rooms
          (project_id,room_name,door_style,drawer_style,species,finish,construction,manufacturer,sort_order)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
          [saved,r.room_name,r.door_style||null,r.drawer_style||null,r.species||null,
            r.finish||null,r.construction||null,r.manufacturer||null,i+1]);
        const roomId=created.rows[0].id;
        if(can(user.role,"settings:manage")){
          await client.query(`INSERT INTO public.project_room_financials(room_id,room_cost,manufacturer_discount)
            VALUES($1,$2,$3)`,[roomId,r.room_cost,r.manufacturer_discount]);
        }
        for(let j=0;j<r.ras_items.length;j++){
          const item=r.ras_items[j];
          await client.query(`INSERT INTO public.rev_a_shelf_items(room_id,item_name,code,link,sort_order)
           VALUES($1,$2,$3,$4,$5)`,[roomId,item.item_name,item.code||null,item.link||null,j+1]);
        }
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Project save failed", error);
    return {error:"Unable to save project."};
  } finally {client.release();}
  revalidatePath("/projects");
  redirect("/projects/"+saved);
}

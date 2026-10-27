'use server';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import PDFDocument from 'pdfkit';
import {requirePermission} from '@/features/auth/session';
import {getDbPool} from '@/lib/db';
import {depositPercentages,maxImageBytes,maxMediaBytes} from './model';
const mediaSchema=z.array(z.object({id:z.uuid(),title:z.string().trim().max(200),fresh:z.boolean()})).max(20).refine(items=>new Set(items.map(i=>i.id)).size===items.length);
export async function saveProposal(_state:{error:string|null},form:FormData):Promise<{error:string|null}> {
 const user=await requirePermission('settings:manage');
 const parsed=z.object({id:z.union([z.uuid(),z.literal('')]),project_id:z.uuid(),percentage:z.coerce.number().refine(n=>depositPercentages.includes(n as typeof depositPercentages[number]))}).safeParse({id:form.get('id')??'',project_id:form.get('project_id'),percentage:form.get('deposit_percentage')});
 if(!parsed.success)return {error:'Select a project and a deposit percentage between 10% and 90%.'};
 let items:z.infer<typeof mediaSchema>;
 try {items=mediaSchema.parse(JSON.parse(String(form.get('media')??'[]')));}catch{return {error:'Invalid media list. Use up to 20 images with titles of at most 200 characters.'};}
 const uploads=new Map<string,{data:Buffer;filename:string;mime:string}>();
 try {
  for(const item of items.filter(i=>i.fresh)) {
   const file=form.get(`image_${item.id}`);
   if(!(file instanceof File)||file.size<1||file.size>maxImageBytes)throw new Error('Each image must be a PNG or JPEG under 2 MB.');
   const data=Buffer.from(await file.arrayBuffer());
   const mime=data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':data[0]===255&&data[1]===216&&data[2]===255?'image/jpeg':null;
   if(!mime)throw new Error('Only PNG and JPEG images are supported.');
   // Decode using the same image reader used by the PDF export; reject broken/oversized renders.
   const doc=new PDFDocument({autoFirstPage:false});
   doc.on('error',()=>{});doc.resume();
   try {const image=(doc as PDFKit.PDFDocument & {openImage(source:Buffer):{width:number;height:number}}).openImage(data);if(image.width*image.height>24000000)throw new Error('Images must be at most 24 megapixels.');}finally{doc.end();}
   uploads.set(item.id,{data,filename:file.name.slice(0,255)||'render',mime});
  }
 }catch(error){return {error:error instanceof Error?error.message:'Unable to read images.'};}
 const client=await getDbPool().connect();
 let saved='';
 try {
  await client.query('BEGIN');
  const {id,project_id,percentage}=parsed.data;
  const project=await client.query('SELECT id FROM public.projects WHERE id=$1 AND deleted_at IS NULL FOR SHARE',[project_id]);
  if(!project.rowCount)throw new Error('Select an existing project.');
  if(id){
   const exists=await client.query('SELECT id FROM public.proposals WHERE id=$1 FOR UPDATE',[id]);
   if(!exists.rowCount)throw new Error('Proposal not found.');
  }
  const old=id?(await client.query<{id:string;bytes:number}>('SELECT id,octet_length(image_data) AS bytes FROM public.proposal_media WHERE proposal_id=$1',[id])).rows:[];
  let bytes=0;
  for(const item of items){
   if(item.fresh){bytes+=uploads.get(item.id)!.data.length;}
   else {const existing=old.find(m=>m.id===item.id);if(!existing)throw new Error('An image is no longer available. Reload this proposal.');bytes+=existing.bytes;}
  }
  if(bytes>maxMediaBytes)throw new Error('Keep the combined image size under 5 MB per proposal.');
  const values=[project_id,percentage,form.get('include_room_finishes')==='on',user.id];
  if(id){await client.query('UPDATE public.proposals SET project_id=$1,deposit_percentage=$2,include_room_finishes=$3,updated_by=$4,updated_at=now() WHERE id=$5',[...values,id]);saved=id;}
  else{saved=(await client.query<{id:string}>('INSERT INTO public.proposals(project_id,deposit_percentage,include_room_finishes,created_by,updated_by) VALUES($1,$2,$3,$4,$4) RETURNING id',values)).rows[0].id;}
  await client.query('DELETE FROM public.proposal_media WHERE proposal_id=$1 AND NOT (id=ANY($2::uuid[]))',[saved,items.filter(i=>!i.fresh).map(i=>i.id)]);
  for(const [index,item] of items.entries()){
   const upload=uploads.get(item.id);
   if(upload)await client.query('INSERT INTO public.proposal_media(id,proposal_id,title,filename,mime_type,image_data,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7)',[item.id,saved,item.title,upload.filename,upload.mime,upload.data,index]);
   else await client.query('UPDATE public.proposal_media SET title=$1,sort_order=$2 WHERE id=$3 AND proposal_id=$4',[item.title,index,item.id,saved]);
  }
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK');console.error('Proposal save failed',error);return {error:error instanceof Error&& !('code' in error)?error.message:'Unable to save proposal. Please try again.'};}
 finally{client.release();}
 revalidatePath('/proposals');revalidatePath(`/proposals/${saved}`);revalidatePath(`/proposals/${saved}/edit`);
 redirect(`/proposals/${saved}`);
}

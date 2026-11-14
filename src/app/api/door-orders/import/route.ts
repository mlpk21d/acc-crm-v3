import {getCurrentCrmUser} from '@/features/auth/session';
import {can} from '@/features/auth/permissions';
import {readPdf} from '@/features/door-orders/read-pdf';
import {parseKcd} from '@/features/door-orders/parse';
export const runtime='nodejs';
export async function POST(request:Request){
 const user=await getCurrentCrmUser();if(!user)return new Response('Sign in required',{status:401});if(!can(user.role,'invoices:write'))return new Response('Forbidden',{status:403});
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Invalid origin',{status:403});
 try{
  // Bound the streamed body even when the client omits Content-Length.
  const reader=request.body?.getReader();if(!reader)return new Response('Missing files',{status:400});const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>22*1024*1024){await reader.cancel();return new Response('Keep the combined upload below 20 MB.',{status:413});}chunks.push(value);}
  const body=Buffer.concat(chunks);const form=await new Response(body,{headers:{'Content-Type':request.headers.get('content-type')??''}}).formData();
  const drawing=form.get('drawings'),list=form.get('list');
  if(!(drawing instanceof File)||!(list instanceof File)||[drawing,list].some(f=>f.size===0||f.size>10*1024*1024))return new Response('Choose two PDF files up to 10 MB each.',{status:400});
  const pages=await readPdf(new Uint8Array(await drawing.arrayBuffer()));const sizes=await readPdf(new Uint8Array(await list.arrayBuffer()));
  return Response.json(parseKcd(pages,sizes,String(form.get('name')||drawing.name.replace(/\.pdf$/i,'')).slice(0,160)),{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return new Response(error instanceof Error?error.message.slice(0,300):'Unable to parse PDFs.',{status:400});}
}

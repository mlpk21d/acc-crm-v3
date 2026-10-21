'use server';
import {revalidatePath} from 'next/cache';
import {requirePermission} from '@/features/auth/session';
import {getDbPool} from '@/lib/db';
import {jkMaxFileBytes,parseJkPriceCsv} from './jk-price-csv';
import {replaceJkPriceCatalog} from './jk-price-import';
export async function importJkPriceList(form:FormData):Promise<{error:string|null;count:number}>{
 await requirePermission('settings:manage');
 const file=form.get('file');
 if(!(file instanceof File)||!file.name.toLowerCase().endsWith('.csv'))return {error:'Choose a CSV file.',count:0};
 if(!file.size||file.size>jkMaxFileBytes)return {error:'CSV files only, max 5MB. The file must not be empty.',count:0};
 let rows;
 try{rows=parseJkPriceCsv(new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer()));}
 catch(error){return {error:error instanceof Error?error.message:'Unable to read CSV. Use a UTF-8 CSV file.',count:0};}
 const client=await getDbPool().connect();
 try{
  await client.query('BEGIN');
  const count=await replaceJkPriceCatalog(client,rows);
  await client.query('COMMIT');
  revalidatePath('/settings');revalidatePath('/projects');
  return {error:null,count};
 }catch{await client.query('ROLLBACK');return {error:'Import failed. The existing price list has been preserved. Please try again.',count:0};}
 finally{client.release();}
}

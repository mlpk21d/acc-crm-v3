import 'server-only';
import type {PoolClient} from 'pg';
import {jkCatalogLabel,type JkPriceCsvRow} from './jk-price-csv';
// The caller authorizes the administrator, validates CSV, and owns the transaction.
export async function replaceJkPriceCatalog(client:PoolClient,rows:JkPriceCsvRow[]){
 if(!rows.length)throw new Error('Cannot replace the catalog with an empty file.');
 await client.query('LOCK TABLE public.jk_price_items IN SHARE ROW EXCLUSIVE MODE');
 // Retire absent rows instead of deleting IDs referenced by saved configurations.
 await client.query('UPDATE public.jk_price_items SET active=false,updated_at=now() WHERE active=true');
 const payload=rows.map(row=>({...row,item:jkCatalogLabel(row)}));
 const result=await client.query(`INSERT INTO public.jk_price_items(series,item_code,tier,price,category,item,description,active)
 SELECT series,item_code,tier,price_usd::numeric,category,item,category,true
 FROM jsonb_to_recordset($1::jsonb) AS x(series text,item_code text,tier text,price_usd text,category text,item text)
 ON CONFLICT(lower(series),lower(item_code),lower(tier))
 WHERE series IS NOT NULL AND item_code IS NOT NULL AND tier IS NOT NULL
 DO UPDATE SET series=EXCLUDED.series,item_code=EXCLUDED.item_code,tier=EXCLUDED.tier,
 price=EXCLUDED.price,category=EXCLUDED.category,item=EXCLUDED.item,description=EXCLUDED.description,active=true,updated_at=now()
 RETURNING id`,[JSON.stringify(payload)]);
 return result.rowCount??0;
}

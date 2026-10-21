import assert from 'node:assert/strict';
import test from 'node:test';
import {parseJkPriceCsv,jkCatalogLabel} from '../src/features/settings/jk-price-csv.ts';
const headers='series,item_code,tier,price_usd,category\n';
test('maps new price list fields by header, ignoring optional source columns',()=>{
 const [row]=parseJkPriceCsv('\uFEFFsku,category,price_usd,tier,item_code,series,dimensions,source_page\r\nsource,"Base, Cabinet",123.4,2,B30,a7,,10\r\n');
 assert.deepEqual(row,{series:'a7',item_code:'B30',tier:'2',price_usd:'123.40',category:'Base, Cabinet'});
 assert.equal(jkCatalogLabel(row),'a7 / B30 / Tier 2');
});
test('parses escaped quotes and quoted newlines in ignored fields',()=>{
 const rows=parseJkPriceCsv(headers.trim()+',notes\na7,"Door ""L""",2,0,Doors,"note\ncontinued"\n');
 assert.equal(rows[0].item_code,'Door "L"');assert.equal(rows[0].price_usd,'0.00');
});
test('keeps variants distinct, but rejects duplicate series/item/tier keys regardless of case',()=>{
 assert.equal(parseJkPriceCsv(headers+'a7,B30,2,100,Base\nb5,B30,2,120,Base\na7,B30,1,90,Base').length,3);
 assert.throws(()=>parseJkPriceCsv(headers+'a7,B30,2,100,Base\nA7,b30,2,100,Base'),/duplicate/);
});
test('rejects missing or duplicate headers, incomplete rows, and malformed quoting',()=>{
 for(const [csv,pattern]of [['series,item_code\na7,B30',/Missing required/],[headers.replace('category','tier'),/repeated/],[headers+'a7,B30,2,100',/fields/],[headers+'a7,"B30,2,100,Base',/Unclosed/],[headers+'a7,"B30"x,2,100,Base',/Unexpected/],[headers+'a7,B"30,2,100,Base',/Invalid quote/]])assert.throws(()=>parseJkPriceCsv(csv),pattern);
});
test('rejects invalid currency and empty inputs before catalog replacement',()=>{
 for(const value of ['-1','NaN','Infinity','1e3','100.001','$100','10000000000'])assert.throws(()=>parseJkPriceCsv(headers+`a7,B30,2,${value},Base`),/price_usd/);
 assert.throws(()=>parseJkPriceCsv(''),/empty/);assert.throws(()=>parseJkPriceCsv(headers),/at least one/);
 assert.throws(()=>parseJkPriceCsv(headers+'a7,,2,100,Base'),/item_code/);
 assert.equal(parseJkPriceCsv(headers+'a7,B30,2,9999999999.99,Base')[0].price_usd,'9999999999.99');
});

export const jkPriceHeaders=['series','item_code','tier','price_usd','category'] as const;
export const jkPriceColumns=['Series','Item Code','Tier','Price','Category'] as const;
export const jkMaxFileBytes=5*1024*1024;
export const jkMaxRows=20000;
export type JkPriceCsvRow=Record<(typeof jkPriceHeaders)[number],string>;

// RFC 4180 fields, including escaped quotes, quoted commas/newlines, and CRLF.
function csvRecords(source:string):{values:string[];line:number}[]{
 const text=source.replace(/^\uFEFF/,'');
 const records:{values:string[];line:number}[]=[];
 let values:string[]=[],value='',quoted=false,closed=false,line=1,startLine=1;
 function field(){values.push(value);value='';closed=false;}
 function record(){field();if(values.some(v=>v.trim()))records.push({values,line:startLine});values=[];if(records.length>jkMaxRows+1)throw new Error(`CSV may contain at most ${jkMaxRows.toLocaleString('en-US')} items.`);}
 for(let i=0;i<text.length;i++){
  const char=text[i];
  if(quoted){
   if(char==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;}}
   else{value+=char;if(char==='\n')line++;}
  }else if(char==='"'){
   if(value||closed)throw new Error(`Invalid quote on CSV line ${line}.`);
   quoted=true;
  }else if(char===','){field();}
  else if(char==='\r'||char==='\n'){
   if(char==='\r'&&text[i+1]==='\n')i++;
   record();line++;startLine=line;
  }else{
   if(closed){if(char===' '||char==='\t')continue;throw new Error(`Unexpected text after a quoted field on CSV line ${line}.`);}
   value+=char;
  }
 }
 if(quoted)throw new Error(`Unclosed quoted field starting near CSV line ${startLine}.`);
 if(value||values.length||closed)record();
 return records;
}
export function jkCatalogLabel(row:JkPriceCsvRow){return `${row.series} / ${row.item_code} / Tier ${row.tier}`;}
export function parseJkPriceCsv(text:string):JkPriceCsvRow[]{
 const records=csvRecords(text);
 if(!records.length)throw new Error('The CSV file is empty.');
 const headers=records[0].values.map(h=>h.trim().toLowerCase());
 if(new Set(headers).size!==headers.length)throw new Error('CSV headers must not be repeated.');
 const missing=jkPriceHeaders.filter(h=>!headers.includes(h));
 if(missing.length)throw new Error(`Missing required CSV headers: ${missing.join(', ')}.`);
 const positions=jkPriceHeaders.map(h=>headers.indexOf(h));
 const rows:JkPriceCsvRow[]=[],seen=new Set<string>();
 for(const record of records.slice(1)){
  if(record.values.length!==headers.length)throw new Error(`CSV line ${record.line} has ${record.values.length} fields; expected ${headers.length}.`);
  const row=Object.fromEntries(jkPriceHeaders.map((key,i)=>[key,record.values[positions[i]].trim()])) as JkPriceCsvRow;
  row.series=row.series.toUpperCase();
  row.item_code=row.item_code.toUpperCase();
  for(const [key,max]of [['series',50],['item_code',150],['tier',20],['category',200]] as const){
   if(!row[key]||row[key].length>max||/[\u0000-\u001f\u007f]/.test(row[key]))throw new Error(`CSV line ${record.line}: ${key} must contain 1–${max} characters without control characters.`);
  }
  if(!/^\d{1,10}(?:\.\d{1,2})?$/.test(row.price_usd))throw new Error(`CSV line ${record.line}: price_usd must be a nonnegative USD amount with at most two decimal places.`);
  const [whole,fraction='']=row.price_usd.split('.');
  row.price_usd=`${BigInt(whole).toString()}.${fraction.padEnd(2,'0')}`;
  if(jkCatalogLabel(row).length>150)throw new Error(`CSV line ${record.line}: combined series, item code and tier are too long (maximum 150 characters).`);
  const key=JSON.stringify([row.series,row.item_code,row.tier].map(v=>v.toLowerCase()));
  if(seen.has(key))throw new Error(`CSV line ${record.line}: duplicate series/item_code/tier (${row.series}, ${row.item_code}, ${row.tier}).`);
  seen.add(key);rows.push(row);
 }
 if(!rows.length)throw new Error('The CSV must contain at least one price list item.');
 return rows;
}

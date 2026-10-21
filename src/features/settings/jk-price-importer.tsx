'use client';
import {useRef,useState,useTransition,type DragEvent} from 'react';
import {ButtonIcon} from '@/components/button-icon';
import {importJkPriceList} from './jk-import-actions';
import {jkPriceHeaders,jkPriceColumns,jkMaxFileBytes,parseJkPriceCsv,type JkPriceCsvRow} from './jk-price-csv';
const currency=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
export function JkPriceImporter(){
 const input=useRef<HTMLInputElement>(null),selection=useRef(0);
 const [file,setFile]=useState<File|null>(null);
 const [rows,setRows]=useState<JkPriceCsvRow[]>([]);
 const [dragging,setDragging]=useState(false),[reading,setReading]=useState(false);
 const [error,setError]=useState(''),[message,setMessage]=useState('');
 const [pending,startTransition]=useTransition();
 const busy=reading||pending;
 async function choose(files:File[]){
  const token=++selection.current;
  setError('');setMessage('');setRows([]);setFile(null);
  if(files.length!==1){setError('Choose one CSV file at a time.');return;}
  const next=files[0];
  if(!/\.csv$/i.test(next.name)){setError('CSV files only, max 5MB.');return;}
  if(!next.size||next.size>jkMaxFileBytes){setError('Choose a nonempty CSV file, max 5MB.');return;}
  setReading(true);
  try{
   const text=new TextDecoder('utf-8',{fatal:true}).decode(await next.arrayBuffer());
   const parsed=parseJkPriceCsv(text);
   if(token===selection.current){setFile(next);setRows(parsed);}
  }catch(e){if(token===selection.current)setError(e instanceof Error?e.message:'Unable to read this CSV file.');}
  finally{if(token===selection.current)setReading(false);}
 }
 function drop(event:DragEvent<HTMLButtonElement>){
  event.preventDefault();setDragging(false);
  if(!busy)void choose(Array.from(event.dataTransfer.files));
 }
 function clear(){selection.current++;setFile(null);setRows([]);setError('');setMessage('');setReading(false);if(input.current)input.current.value='';}
 function upload(){
  if(!file||!rows.length)return;
  setError('');setMessage('');
  const data=new FormData();data.set('file',file);
  startTransition(async()=>{
   try{
    const result=await importJkPriceList(data);
    if(result.error){setError(result.error);return;}
    setMessage(`Imported ${result.count.toLocaleString('en-US')} J&K price list items successfully.`);
    setFile(null);setRows([]);if(input.current)input.current.value='';
   }catch{setError('Unable to import the price list. Please try again.');}
  });
 }
 return <section className="crm-jk-importer" aria-labelledby="jk-import-heading">
  <h2 id="jk-import-heading" className="crm-jk-import-title"><ButtonIcon kind="cabinet"/>Import J&amp;K Price List</h2>
  <div className="crm-jk-required-headers"><p>Required CSV Headers:</p><code>{jkPriceHeaders.join(', ')}</code><p>Importing will replace all existing J&amp;K price list items.</p></div>
  <input ref={input} type="file" accept=".csv,text/csv" className="crm-jk-file-input" aria-label="Upload J&K price list CSV" disabled={busy} onChange={event=>{const files=Array.from(event.target.files??[]);event.target.value='';if(files.length)void choose(files);}}/>
  <button type="button" className={`crm-jk-dropzone${dragging?' dragging':''}`} disabled={busy} onClick={()=>input.current?.click()} onDragOver={event=>{event.preventDefault();if(!busy)setDragging(true);}} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setDragging(false);}} onDrop={drop} aria-label="Click to upload or drag and drop a J&K CSV price list">
   <ButtonIcon kind="upload"/><span>{pending?'Importing price list…':reading?'Reading CSV…':'Click to upload or drag and drop'}</span><small>CSV files only, max 5MB</small>
  </button>
  {error&&<p role="alert" className="crm-jk-import-error">{error}</p>}
  {message&&<p role="status" className="crm-jk-import-success">{message}</p>}
  {file&&rows.length>0&&<div className="crm-jk-import-preview">
   <div className="crm-jk-import-preview-heading"><div><strong>{file.name}</strong><p>{rows.length.toLocaleString('en-US')} items · {new Set(rows.map(r=>r.series.toLowerCase())).size} series</p></div><button type="button" disabled={busy} className="crm-jk-import-button" onClick={clear}><ButtonIcon kind="close"/>Remove file</button></div>
   <div className="crm-jk-preview-scroll"><table><thead><tr>{jkPriceColumns.map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{rows.slice(0,10).map((row,i)=><tr key={i}>{jkPriceHeaders.map(key=><td key={key}>{key==='price_usd'?currency.format(Number(row[key])):row[key]}</td>)}</tr>)}</tbody></table></div>
   <p className="crm-jk-preview-note">Showing {Math.min(rows.length,10)} of {rows.length.toLocaleString('en-US')} items. Saved room cabinet configurations retain their existing prices.</p>
   <button type="button" className="crm-jk-import-button primary" disabled={busy} onClick={upload}><ButtonIcon kind="upload"/>{pending?'Importing…':`Import ${rows.length.toLocaleString('en-US')} items`}</button>
  </div>}
 </section>;
}

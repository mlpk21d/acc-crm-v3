"use client";
import { useEffect, useState } from "react";
import { loadJkConfigAction, saveJkConfiguration, searchJkCatalogAction } from "@/features/projects/jk-actions";
import type { JkPriceItem } from "@/features/projects/jk-data";

type Selection={price_item_id:string|null;item:string;description:string;hinge_direction:""|"L"|"R";quantity:number;custom:boolean;price:number};
const money=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
export function JkConfigurator({projectId,roomId,onClose}:{
 projectId:string;roomId:string;onClose:()=>void;
}) {
 const [items,setItems]=useState<Selection[]>([]);
 const [assemblyCount,setAssemblyCount]=useState(0);
 const [search,setSearch]=useState("");
 const [results,setResults]=useState<JkPriceItem[]>([]);
 const [showCustom,setShowCustom]=useState(false);
 const [customName,setCustomName]=useState("");
 const [customPrice,setCustomPrice]=useState("");
 const [busy,setBusy]=useState(true);
 const [error,setError]=useState("");
 const [savedTotal,setSavedTotal]=useState<string|null>(null);
 useEffect(()=>{
  let mounted=true;
  loadJkConfigAction(projectId,roomId).then(data=>{
   if(!mounted)return;
   setAssemblyCount(data.assemblyCount);
   setItems(data.items.map(item=>({price_item_id:item.price_item_id,item:item.item,description:item.description??"",hinge_direction:item.hinge_direction,quantity:item.quantity,custom:item.custom,price:Number(item.unit_price)})));
  }).catch(()=>{if(mounted)setError("Unable to load J&K configuration.")}).finally(()=>{if(mounted)setBusy(false)});
  return ()=>{mounted=false};
 },[projectId,roomId]);
 useEffect(()=>{
  let live=true;
  if(!search.trim()){setResults([]);return}
  const delay=setTimeout(()=>{
   searchJkCatalogAction(search).then(data=>{if(live)setResults(data)}).catch(()=>{if(live)setError("Unable to search cabinet catalog.")});
  },250);
  return ()=>{live=false;clearTimeout(delay)};
 },[search]);
 const update=(index:number,patch:Partial<Selection>)=>setItems(previous=>previous.map((item,i)=>i===index?{...item,...patch}:item));
 const discounted=(price:number)=>Math.round(Math.round(price*100)*0.8);
 const subtotal=items.reduce((n,item)=>n+discounted(item.price)*item.quantity,0);
 const total=subtotal+assemblyCount*2000;
 async function save() {
  setError("");setSavedTotal(null);setBusy(true);
  try {
   const result=await saveJkConfiguration({projectId,roomId,assemblyCount,items});
   setSavedTotal(result.total);
  }catch{setError("Unable to save configuration. Check cabinet choices and try again.")}
  finally{setBusy(false)}
 }
 return <div className="crm-room-modal-layer">
  <button type="button" className="crm-room-modal-backdrop" aria-label="Close J&K configuration" onClick={onClose}/>
  <section className="crm-room-modal crm-jk-modal" role="dialog" aria-modal="true" aria-labelledby="jk-title">
   <div className="crm-room-modal-title"><h2 id="jk-title">Configure J&amp;K Cabinets</h2><button type="button" aria-label="Close" onClick={onClose}>×</button></div>
   <div className="crm-jk-content">
    {error&&<p role="alert" className="contact-form-error">{error}</p>}
    {savedTotal&&<p role="status">Configuration saved. Total: {money(Math.round(Number(savedTotal)*100))}</p>}
    <div className="crm-jk-search"><input aria-label="Search J&K price list" placeholder="Search J&K price list..." value={search} onChange={event=>setSearch(event.target.value)}/><button type="button" onClick={()=>setShowCustom(!showCustom)}>+ Custom</button></div>
    {results.length>0&&<div className="crm-jk-results">{results.map(item=><button type="button" key={item.id} onClick={()=>{setItems(old=>[...old,{price_item_id:item.id,item:item.item,description:item.description??"",hinge_direction:"",quantity:1,custom:false,price:Number(item.price)}]);setSearch("");setResults([])}}>{item.item} — {money(Math.round(Number(item.price)*100))}</button>)}</div>}
    {showCustom&&<div className="crm-jk-custom"><input placeholder="Item Name" aria-label="Custom item name" value={customName} maxLength={150} onChange={e=>setCustomName(e.target.value)}/><input type="number" min="0" step="0.01" placeholder="Price" aria-label="Custom price" value={customPrice} onChange={e=>setCustomPrice(e.target.value)}/><button type="button" onClick={()=>{const price=Number(customPrice);if(!customName.trim()||!customPrice||!Number.isFinite(price)||price<0)return;setItems(old=>[...old,{price_item_id:null,item:customName.trim(),description:"",hinge_direction:"",quantity:1,custom:true,price}]);setCustomName("");setCustomPrice("");setShowCustom(false)}}>Add Item</button></div>}
    <div className="crm-rooms-scroll"><table className="contact-table"><thead><tr><th>#</th><th>Item</th><th>Hinge</th><th>Description</th><th>Unit Price</th><th>Disc. (20%)</th><th>Qty</th><th>Line Total</th><th>Actions</th></tr></thead><tbody>
    {items.map((item,index)=><tr key={index}><td>{index+1}</td><td>{item.item}</td><td><select aria-label={item.item+" hinge"} value={item.hinge_direction} onChange={e=>update(index,{hinge_direction:e.target.value as ""|"L"|"R"})}><option value="">—</option><option value="L">L</option><option value="R">R</option></select></td><td>{item.description}</td><td>{money(Math.round(item.price*100))}</td><td>{money(discounted(item.price))}</td><td><input aria-label={item.item+" quantity"} type="number" min="1" max="10000" value={item.quantity} onChange={e=>update(index,{quantity:Math.max(1,Math.min(10000,Number(e.target.value)||1))})}/></td><td>{money(discounted(item.price)*item.quantity)}</td><td><button type="button" disabled={index===0} onClick={()=>setItems(old=>{const copy=[...old];[copy[index-1],copy[index]]=[copy[index],copy[index-1]];return copy})}>↑</button><button type="button" disabled={index===items.length-1} onClick={()=>setItems(old=>{const copy=[...old];[copy[index],copy[index+1]]=[copy[index+1],copy[index]];return copy})}>↓</button><button type="button" aria-label={"Remove "+item.item} onClick={()=>setItems(old=>old.filter((_,i)=>i!==index))}>×</button></td></tr>)}
    </tbody></table></div>
    <div className="crm-jk-totals"><label>Assembly Count <input type="number" min="0" max="10000" value={assemblyCount} onChange={e=>setAssemblyCount(Math.max(0,Math.min(10000,Number(e.target.value)||0)))}/></label><span>Cabinets: {money(subtotal)}</span><span>Assembly: {money(assemblyCount*2000)}</span><strong>Total: {money(total)}</strong></div>
    <div className="crm-room-modal-actions"><button type="button" onClick={onClose}>Cancel</button><button type="button" disabled={busy} onClick={save}>{busy?"Saving…":"Apply Configuration"}</button></div>
   </div>
  </section>
 </div>;
}

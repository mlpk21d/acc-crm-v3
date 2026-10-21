"use client";
import { ButtonIcon } from "@/components/button-icon";
import { useEffect, useRef, useState } from "react";
import { loadJkConfigAction, saveJkConfiguration } from "@/features/projects/jk-actions";
import {JkCatalogSearch} from "@/features/projects/jk-catalog-search";

import type {JkSelection as Selection,JkDraft} from "@/features/projects/jk-model";
const money=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
export function JkConfigurator({projectId,roomId,onClose,initialConfig,onApply}:{
 projectId:string;roomId?:string;onClose:()=>void;initialConfig?:JkDraft;onApply?:(config:JkDraft)=>void;
}) {
 const [items,setItems]=useState<Selection[]>(initialConfig?.items??[]);
 const [assemblyCount,setAssemblyCount]=useState(initialConfig?.assemblyCount??0);
 const [showCustom,setShowCustom]=useState(false);
 const [customName,setCustomName]=useState("");
 const [customPrice,setCustomPrice]=useState("");
 const [customDescription,setCustomDescription]=useState("");
 const [busy,setBusy]=useState(!!roomId&&!initialConfig);
 const [loadFailed,setLoadFailed]=useState(false);
 const modal=useRef<HTMLElement>(null);
 const [error,setError]=useState("");
 const [savedTotal,setSavedTotal]=useState<string|null>(null);
 useEffect(()=>{
  let mounted=true;
  if(initialConfig||!roomId)return;
  loadJkConfigAction(projectId,roomId).then(data=>{
   if(!mounted)return;
   setAssemblyCount(data.assemblyCount);
   setItems(data.items.map(item=>({price_item_id:item.price_item_id,item:item.item,description:item.description??"",hinge_direction:item.hinge_direction,quantity:item.quantity,custom:item.custom,price:Number(item.unit_price)})));
  }).catch(()=>{if(mounted){setError("Unable to load J&K configuration.");setLoadFailed(true)}}).finally(()=>{if(mounted)setBusy(false)});
  return ()=>{mounted=false};
 },[projectId,roomId,initialConfig]);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  modal.current?.focus();
  function keyboard(event:KeyboardEvent){
   if(event.key==="Escape"){event.preventDefault();event.stopPropagation();onClose();}
   if(event.key==="Tab"){
    const controls=Array.from(modal.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')??[]);
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&(document.activeElement===first||document.activeElement===modal.current)){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===modal.current)){event.preventDefault();first?.focus();}
   }
  }
  const element=modal.current;element?.addEventListener("keydown",keyboard);
  return ()=>{element?.removeEventListener("keydown",keyboard);previous?.focus();};
 },[onClose]);
 const update=(index:number,patch:Partial<Selection>)=>setItems(previous=>previous.map((item,i)=>i===index?{...item,...patch}:item));
 const discounted=(price:number)=>Math.round(Math.round(price*100)*0.8);
 const subtotal=items.reduce((n,item)=>n+discounted(item.price)*item.quantity,0);
 const total=subtotal+assemblyCount*2000;
 async function save() {
  if(onApply){onApply({items,assemblyCount});return;}
  if(!roomId)return;
  setError("");setSavedTotal(null);setBusy(true);
  try {
   const result=await saveJkConfiguration({projectId,roomId,assemblyCount,items});
   setSavedTotal(result.total);
  }catch{setError("Unable to save configuration. Check cabinet choices and try again.")}
  finally{setBusy(false)}
 }
 return <div className="crm-room-modal-layer crm-jk-modal-layer">
  <button type="button" className="crm-room-modal-backdrop" aria-label="Close J&K configuration" onClick={onClose}><ButtonIcon kind="close" /></button>
  <section className="crm-room-modal crm-jk-modal" role="dialog" aria-modal="true" aria-labelledby="jk-title" ref={modal} tabIndex={-1}>
   <div className="crm-room-modal-title"><h2 id="jk-title">Configure J&amp;K Cabinets</h2><button type="button" aria-label="Close" onClick={onClose}><ButtonIcon kind="close" /></button></div>
   <div className="crm-jk-content">
    {error&&<p role="alert" className="contact-form-error">{error}</p>}
    {savedTotal&&<p role="status">Configuration saved. Total: {money(Math.round(Number(savedTotal)*100))}</p>}
    <div className="crm-jk-search"><JkCatalogSearch disabled={busy} onSelect={item=>setItems(old=>[...old,{price_item_id:item.id,item:item.item,description:item.description??"",hinge_direction:"",quantity:1,custom:false,price:Number(item.price)}])}/><button type="button" onClick={()=>setShowCustom(!showCustom)}><ButtonIcon kind="add"/>Custom</button></div>
    {showCustom&&<div className="crm-jk-custom"><input placeholder="Item Name" aria-label="Custom item name" value={customName} maxLength={150} onChange={e=>setCustomName(e.target.value)}/><input placeholder="Description" aria-label="Custom description" maxLength={2000} value={customDescription} onChange={e=>setCustomDescription(e.target.value)}/><input type="number" min="0" step="0.01" placeholder="Price" aria-label="Custom price" value={customPrice} onChange={e=>setCustomPrice(e.target.value)}/><button type="button" onClick={()=>{const price=Number(customPrice);if(!customName.trim()||!customPrice||!Number.isFinite(price)||price<0)return;setItems(old=>[...old,{price_item_id:null,item:customName.trim(),description:customDescription.trim(),hinge_direction:"",quantity:1,custom:true,price}]);setCustomName("");setCustomDescription("");setCustomPrice("");setShowCustom(false)}}>Add Item<ButtonIcon kind="edit" /></button></div>}
    <div className="crm-rooms-scroll"><table className="contact-table"><thead><tr><th>#</th><th>Item</th><th>Hinge</th><th>Description</th><th>Unit Price</th><th>Disc. (20%)</th><th>Qty</th><th>Line Total</th><th>Actions</th></tr></thead><tbody>
    {items.map((item,index)=><tr key={index}><td>{index+1}</td><td>{item.item}</td><td><select aria-label={item.item+" hinge"} value={item.hinge_direction} onChange={e=>update(index,{hinge_direction:e.target.value as ""|"L"|"R"})}><option value="">—</option><option value="L">L</option><option value="R">R</option></select></td><td>{item.description}</td><td>{money(Math.round(item.price*100))}</td><td>{money(discounted(item.price))}</td><td><input aria-label={item.item+" quantity"} type="number" min="1" max="10000" value={item.quantity} onChange={e=>update(index,{quantity:Math.max(1,Math.min(10000,Number(e.target.value)||1))})}/></td><td>{money(discounted(item.price)*item.quantity)}</td><td><button type="button" disabled={index===0} onClick={()=>setItems(old=>{const copy=[...old];[copy[index-1],copy[index]]=[copy[index],copy[index-1]];return copy})} aria-label={"Move "+item.item+" up"}><ButtonIcon kind="up" /></button><button type="button" disabled={index===items.length-1} onClick={()=>setItems(old=>{const copy=[...old];[copy[index],copy[index+1]]=[copy[index+1],copy[index]];return copy})} aria-label={"Move "+item.item+" down"}><ButtonIcon kind="down" /></button><button type="button" aria-label={"Remove "+item.item} onClick={()=>setItems(old=>old.filter((_,i)=>i!==index))}><ButtonIcon kind="delete" /></button></td></tr>)}
    </tbody></table></div>
    <div className="crm-jk-totals"><label>Assembly Count <input type="number" min="0" max="10000" value={assemblyCount} onChange={e=>setAssemblyCount(Math.max(0,Math.min(10000,Number(e.target.value)||0)))}/></label><span>Cabinets: {money(subtotal)}</span><span>Assembly: {money(assemblyCount*2000)}</span><strong>Total: {money(total)}</strong></div>
    <div className="crm-room-modal-actions"><button type="button" onClick={onClose}>Cancel<ButtonIcon kind="close" /></button><button type="button" disabled={busy||loadFailed} onClick={save}>{busy?"Saving…":"Apply Configuration"}<ButtonIcon kind="save" /></button></div>
   </div>
  </section>
 </div>;
}

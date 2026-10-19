"use client";
import { useState } from "react";
import { saveProjectFinancials,saveRoomFinancials } from "@/features/projects/financial-actions";
import type { ProjectFinancials,RoomFinancial } from "@/features/projects/financial-data";
type Props={projectId:string;financials:ProjectFinancials;rooms:RoomFinancial[];roomNames:Record<string,string>};
const currency=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(value);
export function ProjectFinancialPanel({projectId,financials,rooms,roomNames}:Props){
 const [data,setData]=useState(financials);
 const [roomRows,setRoomRows]=useState(rooms);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const moneyKeys=["install_cost","misc_cost","drawing_cost","freight","doors_pulls"] as const;
 const titles=["Install Cost","Misc Cost","Drawing Cost","Freight","Doors/Pulls"];
 const toCents=(value:string)=>Math.round(Number(value||0)*100);
 const roomTotal=roomRows.reduce((sum,r)=>sum+Math.round(toCents(r.room_cost)*(1-Number(r.manufacturer_discount)/100)),0);
 const total=roomTotal+moneyKeys.reduce((sum,key)=>sum+toCents(data[key]),0);
 const margin=data.margin_type==="other"?Number(data.custom_margin)*100:Number(data.margin_type);
 const totalCost=margin>=0&&margin<100?Math.round(total/(1-margin/100)):total;
 const cards=[["Room Costs",roomTotal],["Total",total],["Total Cost",totalCost],["Profit",totalCost-total]];
 async function submitProject(form:FormData){setError("");setBusy(true);try{await saveProjectFinancials(form)}catch{setError("Unable to save project financials.")}finally{setBusy(false)}}
 async function submitRoom(form:FormData){setError("");setBusy(true);try{await saveRoomFinancials(form)}catch{setError("Unable to save room financials.")}finally{setBusy(false)}}
 return <section className="content-card crm-project-financial"><h2>Financial Summary</h2>
  {error&&<p role="alert" className="contact-form-error">{error}</p>}
  <form action={submitProject} className="crm-project-financial-form">
   <input name="project_id" type="hidden" value={projectId}/>
   <div className="crm-project-financial-inputs">
    {moneyKeys.map((key,i)=><label key={key}>{titles[i]}<input type="number" name={key} min="0" step="0.01" required value={data[key]} onChange={e=>setData(old=>({...old,[key]:e.target.value}))}/></label>)}
    <label>Margin<select name="margin_type" value={data.margin_type} onChange={e=>setData(old=>({...old,margin_type:e.target.value as ProjectFinancials["margin_type"]}))}><option value="35">35%</option><option value="25">25%</option><option value="other">Other</option></select></label>
    {data.margin_type==="other"&&<label>Custom Margin (%)<input name="custom_margin" type="number" step="0.01" min="0" max="99" value={String(Number(data.custom_margin)*100)} onChange={e=>setData(old=>({...old,custom_margin:String((Number(e.target.value)||0)/100)}))}/></label>}
    {data.margin_type!=="other"&&<input name="custom_margin" type="hidden" value="0"/>}
   </div>
   <button type="submit" disabled={busy}>Save Financials</button>
  </form>
  <div className="crm-project-financial-cards">{cards.map(([label,value])=><div key={label} className={label==="Total Cost"?"crm-project-financial-highlight":""}><span>{label}</span><strong>{currency(Number(value)/100)}</strong></div>)}</div>
  <p className="crm-project-margin-label">Margin: {margin.toFixed(2)}% · Total Cost = Total / (1 - Margin)</p>
  <h3>Room Costs</h3>
  {roomRows.length===0?<p>No rooms added.</p>:<div className="crm-project-room-financials">
   {roomRows.map(row=><form action={submitRoom} key={row.room_id} className="crm-project-room-financial-row">
    <input name="project_id" type="hidden" value={projectId}/><input name="room_id" type="hidden" value={row.room_id}/>
    <strong>{roomNames[row.room_id]??"Room"}</strong>
    <label>Room Cost<input type="number" name="room_cost" min="0" step="0.01" required value={row.room_cost} onChange={e=>setRoomRows(prev=>prev.map(r=>r.room_id===row.room_id?{...r,room_cost:e.target.value}:r))}/></label>
    <label>Manufacturer Discount (%)<input type="number" name="manufacturer_discount" min="0" max="100" step="0.001" required value={row.manufacturer_discount} onChange={e=>setRoomRows(prev=>prev.map(r=>r.room_id===row.room_id?{...r,manufacturer_discount:e.target.value}:r))}/></label>
    <button type="submit" disabled={busy}>Save Room Cost</button>
   </form>)}
  </div>}
 </section>;
}

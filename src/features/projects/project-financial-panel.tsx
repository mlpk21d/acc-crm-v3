"use client";
import { useState } from "react";
import type { ProjectFinancials,RoomFinancial } from "@/features/projects/financial-data";
type Props={projectId:string;financials:ProjectFinancials;rooms:RoomFinancial[];roomNames:Record<string,string>;editable?:boolean};
const currency=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(value);
const fields=[["install_cost","Install Cost"],["misc_cost","Misc Cost"],["drawing_cost","Drawing Cost"],["freight","Freight"],["doors_pulls","Doors/Pulls"]] as const;
export function ProjectFinancialPanel({financials,rooms,editable=false}:Props){
 const [data,setData]=useState(financials);
 const cents=(value:string)=>Math.round((Number(value)||0)*100);
 const roomTotal=rooms.reduce((sum,r)=>sum+Math.round(cents(r.room_cost)*(1-Number(r.manufacturer_discount)/100)),0);
 const total=roomTotal+fields.reduce((sum,[key])=>sum+cents(data[key]),0);
 const margin=data.margin_type==="other"?Number(data.custom_margin)*100:Number(data.margin_type);
 const totalCost=margin>=0&&margin<100?Math.round(total/(1-margin/100)):total;
 const cards=[["Room Costs",roomTotal],["Total",total],["Total Cost",totalCost],["Profit",totalCost-total]] as const;
 return <section className="content-card crm-project-financial"><h2>Financial Information (Admin Only)</h2>
  <div className="crm-project-financial-inputs">
   {fields.map(([key,label])=><label key={key}>{label}<input form={editable?"crm-project-core-form":undefined} name={editable?key:undefined} type="number" min="0" max="99999999" step="0.01" required={editable} disabled={!editable} value={data[key]} onChange={e=>setData(old=>({...old,[key]:e.target.value}))}/></label>)}
   <label>Margin<select form={editable?"crm-project-core-form":undefined} name={editable?"margin_type":undefined} disabled={!editable} value={data.margin_type} onChange={e=>setData(old=>({...old,margin_type:e.target.value as ProjectFinancials["margin_type"]}))}><option value="35">35%</option><option value="25">25%</option><option value="other">Other</option></select></label>
   {data.margin_type==="other"&&<label>Custom Margin (%)<input form={editable?"crm-project-core-form":undefined} name={editable?"custom_margin_percent":undefined} disabled={!editable} type="number" min="0" max="99" step="0.01" required={editable} value={String(Number(data.custom_margin)*100)} onChange={e=>setData(old=>({...old,custom_margin:String((Number(e.target.value)||0)/100)}))}/></label>}
  </div>
  <div className="crm-project-financial-cards">{cards.map(([label,value])=><div key={label} className={label==="Total Cost"||label==="Profit"?"crm-project-financial-highlight":""}><span>{label}</span><strong>{currency(value/100)}</strong></div>)}</div>
  <p className="crm-project-margin-label">Margin: {margin.toFixed(2)}% · Total Cost = Total / (1 - Margin)</p>
 </section>;
}

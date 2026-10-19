"use client";
import {useState} from "react";
const labels=[["install_cost","Install Cost"],["misc_cost","Misc Cost"],["drawing_cost","Drawing Cost"],["freight","Freight"],["doors_pulls","Doors/Pulls"]] as const;
const cash=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
export function NewProjectFinancialFields(){
 const [values,setValues]=useState<Record<string,string>>({install_cost:"0",misc_cost:"0",drawing_cost:"0",freight:"0",doors_pulls:"0"});
 const [marginType,setMarginType]=useState("35");
 const [customMargin,setCustomMargin]=useState("0");
 const total=labels.reduce((sum,[key])=>sum+Math.round((Number(values[key])||0)*100),0);
 const margin=marginType==="other"?Number(customMargin)||0:Number(marginType);
 const selling=margin>=0&&margin<100?Math.round(total/(1-margin/100)):total;
 return <section className="content-card crm-project-financial">
  <h2>Financial Summary</h2>
  <div className="crm-project-financial-inputs">
   {labels.map(([key,label])=><label key={key}>{label}<input form="crm-project-core-form" name={key} type="number" step="0.01" min="0" max="99999999" required value={values[key]} onChange={e=>setValues(old=>({...old,[key]:e.target.value}))}/></label>)}
   <label>Margin<select form="crm-project-core-form" name="margin_type" value={marginType} onChange={e=>setMarginType(e.target.value)}><option value="35">35%</option><option value="25">25%</option><option value="other">Other</option></select></label>
   {marginType==="other"&&<label>Custom Margin (%)<input form="crm-project-core-form" name="custom_margin_percent" type="number" min="0" max="99" step="0.01" required value={customMargin} onChange={e=>setCustomMargin(e.target.value)}/></label>}
  </div>
  <div className="crm-project-financial-cards">
   {([["Room Costs",0],["Total",total],["Total Cost",selling],["Profit",selling-total]] as const).map(([label,value])=><div key={label} className={label==="Total Cost"?"crm-project-financial-highlight":""}><span>{label}</span><strong>{cash(value)}</strong></div>)}
  </div>
  <p className="crm-project-margin-label">Margin: {margin.toFixed(2)}% · Room costs can be added after creating rooms.</p>
 </section>;
}

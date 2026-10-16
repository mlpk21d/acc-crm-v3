"use client";
import { useState } from "react";
import { addDropdownOption, editDropdownOption, toggleDropdownOption, moveDropdownOption, deleteDropdownOption } from "@/features/settings/dropdown-actions";

export type Option = { id:string; category:string; value:string; label:string; color:string|null; active:boolean; sort_order:number };
const categories = [
 {value:"type",label:"Type"},{value:"region",label:"Region"},{value:"status",label:"Status"},
 {value:"project_status",label:"Project Status"},{value:"manufacturer",label:"Manufacturers"}
] as const;
const colored = new Set(["status","project_status","manufacturer"]);

export function DropdownSettings({options}: {options:Option[]}) {
 const [category,setCategory]=useState<string>("type");
 const [adding,setAdding]=useState(false);
 const [editing,setEditing]=useState<string|null>(null);
 const visible=options.filter(o=>o.category===category);
 const showColor=colored.has(category);
 return <div className="crm-settings-dropdowns">
  <div className="crm-settings-tabs" role="tablist" aria-label="Dropdown categories">
   {categories.map(c=><button key={c.value} type="button" role="tab" aria-selected={category===c.value} className={category===c.value?"selected":""} onClick={()=>{setCategory(c.value);setAdding(false);setEditing(null)}}>{c.label}</button>)}
  </div>
  <section className="crm-settings-option-panel">
   <div className="crm-settings-option-heading"><h2>{categories.find(c=>c.value===category)?.label} Options</h2><button type="button" onClick={()=>setAdding(!adding)}>+ Add Option</button></div>
   {adding&&<form action={async data=>{await addDropdownOption(data);setAdding(false)}} className="crm-settings-edit-row crm-settings-add-row">
     <input name="category" type="hidden" value={category}/>
     <input name="label" aria-label="New option name" required maxLength={100} placeholder="New option name" autoFocus />
     {showColor&&<label>Color <input name="color" type="color" defaultValue="#e5e7eb"/></label>}
     <button type="submit">Add</button><button type="button" className="crm-option-icon" aria-label="Cancel adding" title="Cancel" onClick={()=>setAdding(false)}>×</button>
   </form>}
   {visible.length===0&&<p className="crm-settings-empty">No options yet. Add one to get started.</p>}
   {visible.map((o,i)=><div key={o.id} className="crm-settings-option-row">
    {editing===o.id?
     <form action={async data=>{await editDropdownOption(data);setEditing(null)}} className="crm-settings-edit-row">
      <input type="hidden" name="category" value={o.category}/><input type="hidden" name="value" value={o.value}/>
      <input name="label" aria-label="Edit label" required maxLength={100} defaultValue={o.label} autoFocus/>
      {showColor&&<label>Color <input type="color" name="color" defaultValue={o.color??"#e5e7eb"}/></label>}
      <button type="submit">Save</button><button type="button" onClick={()=>setEditing(null)}>Cancel</button>
     </form>
    :<>
     <span className="crm-option-order">{i+1}</span>
     {showColor&&<span className="crm-option-swatch" style={{backgroundColor:o.color??"#e5e7eb"}}/>}
     <span className={o.active?"crm-option-label":"crm-option-label inactive"}>{o.label}</span>
     <span className={o.active?"crm-option-active":"crm-option-inactive"}>{o.active?"Active":"Inactive"}</span>
     <div className="crm-option-controls">
      {(["up","down"] as const).map(dir=><form action={moveDropdownOption} key={dir}>
       <input type="hidden" name="category" value={o.category}/><input type="hidden" name="value" value={o.value}/><input type="hidden" name="id" value={o.id}/><input type="hidden" name="direction" value={dir}/>
       <button type="submit" className="crm-option-icon" aria-label={(dir==="up"?"Move up ":"Move down ")+o.label} title={dir==="up"?"Move up":"Move down"} disabled={dir==="up"?i===0:i===visible.length-1}>{dir==="up"?"↑":"↓"}</button>
      </form>)}
      <button type="button" className="crm-option-icon" aria-label={"Edit "+o.label} title="Edit" onClick={()=>setEditing(o.id)}>✎</button>
      <form action={toggleDropdownOption}><input type="hidden" name="category" value={o.category}/><input type="hidden" name="value" value={o.value}/><button type="submit" className="crm-option-icon" aria-label={(o.active?"Deactivate ":"Activate ")+o.label} title={o.active?"Deactivate":"Activate"}>{o.active?"×":"✓"}</button></form>
      <form action={deleteDropdownOption}><input type="hidden" name="category" value={o.category}/><input type="hidden" name="value" value={o.value}/><button type="submit" className="crm-option-icon crm-option-delete" title="Retire option" aria-label={"Retire "+o.label}>♜</button></form>
     </div>
    </>}
   </div>)}
  </section>
  <p className="crm-settings-tip">Deactivate options instead of deleting them to preserve historical records, especially manufacturers associated with existing projects.</p>
 </div>;
}

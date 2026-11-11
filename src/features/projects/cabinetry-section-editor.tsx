"use client";
import {ButtonIcon} from "@/components/button-icon";
import {
 cabinetryConstructions, cabinetryFields, maxCabinetrySections,
 primaryCabinetryLabel, validCabinetrySectionNames, type CabinetrySection, type CabinetrySpecs,
} from "./cabinetry-sections";

import type {CabinetrySectionFinancial} from "./cabinetry-section-financials";

export function CabinetrySectionEditor({roomName, sections, onChange, readPrimary, manufacturers, financials}: {
 roomName: string;
 sections: CabinetrySection[];
 onChange: (sections: CabinetrySection[]) => void;
 readPrimary: (form: HTMLFormElement | null) => CabinetrySpecs;
 manufacturers: {value:string;label:string}[];
 financials?: {
  values: CabinetrySectionFinancial[];
  onChange: (entries: CabinetrySectionFinancial[]) => void;
 };
}) {
 const primaryLabel = primaryCabinetryLabel(roomName);

 function addSection() {
  onChange([...sections, {
   id: crypto.randomUUID(), name: "", door_style: "", drawer_style: "",
   species: "", finish: "", construction: "", manufacturer: "",
  }]);
 }

 function updateSection(index: number, values: Partial<CabinetrySection>) {
  onChange(sections.map((section, i) => i === index ? {...section, ...values} : section));
 }

 function sectionCost(sectionId: string): CabinetrySectionFinancial {
  return financials?.values.find(entry=>entry.section_id===sectionId) ??
   {section_id:sectionId,room_cost:"0",manufacturer_discount:"0"};
 }

 function updateCost(sectionId: string, field: "room_cost" | "manufacturer_discount", value: string) {
  if(!financials)return;
  financials.onChange([...financials.values.filter(entry=>entry.section_id!==sectionId),
   {...sectionCost(sectionId),[field]:value}]);
 }

 function removeSection(sectionId: string) {
  onChange(sections.filter(section=>section.id!==sectionId));
  financials?.onChange(financials.values.filter(entry=>entry.section_id!==sectionId));
 }

 return <section className="crm-cabinetry-sections" aria-label="Cabinetry Sections">
  <button type="button" className="proposal-button" onClick={addSection} disabled={sections.length >= maxCabinetrySections}>
   <ButtonIcon kind="add"/>Add Cabinetry Section
  </button>
  {sections.length > 0 && !validCabinetrySectionNames(roomName, sections) &&
   <p className="contact-form-error" role="status">Give each cabinetry section a unique name.</p>}
  {sections.map((section, index) => <fieldset key={section.id} className="crm-cabinetry-section">
   <legend>{section.name.trim() || "New Cabinetry Section"}</legend>
   <div className="crm-new-room-fields">
    <label>Section Name<input value={section.name} maxLength={80} required onChange={event=>updateSection(index,{name:event.target.value})}/></label>
    {financials&&<div className="crm-new-room-cost-pair">
     <label>Room Cost<input type="number" min="0" max="99999999" step="0.01" required
      value={sectionCost(section.id).room_cost} onChange={event=>updateCost(section.id,"room_cost",event.target.value)}/></label>
     <label>Mfr Discount %<input type="number" min="0" max="100" step="0.001" required
      value={sectionCost(section.id).manufacturer_discount}
      onChange={event=>updateCost(section.id,"manufacturer_discount",event.target.value)}/></label>
    </div>}
    {cabinetryFields.map(([field,label])=>{
     const options = field === "manufacturer" ? manufacturers : field === "construction" ?
      cabinetryConstructions.map(value=>({value,label:value})) : null;
     return <label key={field}>{label}
      {options ? <select value={section[field]} onChange={event=>updateSection(index,{[field]:event.target.value})}>
       <option value="">Select...</option>
       {options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
       {section[field] && !options.some(option=>option.value===section[field]) &&
        <option value={section[field]}>{section[field]}</option>}
      </select> : <input value={section[field]} maxLength={200} onChange={event=>updateSection(index,{[field]:event.target.value})}/>}
     </label>;
    })}
   </div>
   <div className="crm-cabinetry-section-actions">
    <button type="button" className="proposal-button" onClick={event=>updateSection(index,readPrimary(event.currentTarget.form))}>
     <ButtonIcon kind="layers"/>Copy from {primaryLabel}
    </button>
    <button type="button" className="proposal-button" onClick={()=>removeSection(section.id)}>
     <ButtonIcon kind="delete"/>Remove Section
    </button>
   </div>
  </fieldset>)}
 </section>;
}

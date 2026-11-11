"use client";
import {ButtonIcon} from "@/components/button-icon";
import {
 cabinetryConstructions, cabinetryFields, maxCabinetrySections,
 primaryCabinetryLabel, validCabinetrySectionNames, type CabinetrySection, type CabinetrySpecs,
} from "./cabinetry-sections";

export function CabinetrySectionEditor({roomName, sections, onChange, readPrimary, manufacturers}: {
 roomName: string;
 sections: CabinetrySection[];
 onChange: (sections: CabinetrySection[]) => void;
 readPrimary: (form: HTMLFormElement | null) => CabinetrySpecs;
 manufacturers: {value:string;label:string}[];
}) {
 const primaryLabel = primaryCabinetryLabel(roomName);

 function addSection() {
  const island = primaryLabel === "Perimeter" && !sections.some(section => /^island$/i.test(section.name.trim()));
  onChange([...sections, {
   name: island ? "Island" : "", door_style: "", drawer_style: "",
   species: "", finish: "", construction: "", manufacturer: "",
  }]);
 }

 function updateSection(index: number, values: Partial<CabinetrySection>) {
  onChange(sections.map((section, i) => i === index ? {...section, ...values} : section));
 }

 return <section className="crm-cabinetry-sections" aria-label="Cabinetry Sections">
  <button type="button" className="proposal-button" onClick={addSection} disabled={sections.length >= maxCabinetrySections}>
   <ButtonIcon kind="add"/>Add Cabinetry Section
  </button>
  {sections.length > 0 && !validCabinetrySectionNames(roomName, sections) &&
   <p className="contact-form-error" role="status">Give each cabinetry section a unique name.</p>}
  {sections.map((section, index) => <fieldset key={index} className="crm-cabinetry-section">
   <legend>{section.name.trim() || "New Cabinetry Section"}</legend>
   <div className="crm-new-room-fields">
    <label>Section Name<input value={section.name} maxLength={80} required onChange={event=>updateSection(index,{name:event.target.value})}/></label>
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
    <button type="button" className="proposal-button" onClick={()=>onChange(sections.filter((_,i)=>i!==index))}>
     <ButtonIcon kind="delete"/>Remove Section
    </button>
   </div>
  </fieldset>)}
 </section>;
}

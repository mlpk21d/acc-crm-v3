"use client";
import { ButtonIcon } from "@/components/button-icon";
import {Fragment,useState} from "react";
import {sectionFinancialsSchema,type CabinetrySectionFinancial} from "./cabinetry-section-financials";
import {CabinetrySectionEditor} from "./cabinetry-section-editor";
import {cabinetryConstructions,primaryCabinetryLabel,validCabinetrySectionNames,type CabinetrySection} from "./cabinetry-sections";

import {RoomSpecCells,manufacturerRowStyle} from "./room-spec-cells";

const currency=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"});

export type DraftRoom={room_name:string;door_style:string;drawer_style:string;species:string;finish:string;construction:string;manufacturer:string;room_cost:string;manufacturer_discount:string;cabinetry_sections:CabinetrySection[];section_financials:CabinetrySectionFinancial[];ras_items:{item_name:string;code:string;link:string}[]};
const blank=():DraftRoom=>({room_name:"",door_style:"",drawer_style:"",species:"",finish:"",construction:"",manufacturer:"",room_cost:"0",manufacturer_discount:"0",cabinetry_sections:[],section_financials:[],ras_items:[]});

export function NewProjectRooms({manufacturers,isAdmin}:{manufacturers:{value:string;label:string;color:string|null}[];isAdmin:boolean}){
 const [rooms,setRooms]=useState<DraftRoom[]>([]);
 const [editing,setEditing]=useState<number|null>(null);
 const [draft,setDraft]=useState<DraftRoom>(blank());
 const update=(key:keyof DraftRoom,value:string)=>setDraft(old=>({...old,[key]:value}));
 function open(index:number|null){setEditing(index??-1);setDraft(index===null?blank():structuredClone(rooms[index]));}
 const sectionCostsValid=sectionFinancialsSchema.safeParse(draft.section_financials).success;
 const sectionNamesValid=validCabinetrySectionNames(draft.cabinetry_sections);
 function apply(){if(!sectionCostsValid||!sectionNamesValid||!draft.room_name.trim()||draft.ras_items.some(i=>!i.item_name.trim()||(i.link&&!/^https?:\/\//.test(i.link))))return;setRooms(old=>editing===-1?[...old,draft]:old.map((r,i)=>i===editing?draft:r));setEditing(null)}
 return <section className="content-card crm-project-rooms">
  <div className="crm-rooms-heading"><h2><ButtonIcon kind="layers"/>Rooms ({rooms.length})</h2><button type="button" onClick={()=>open(null)}><ButtonIcon kind="add"/>Add Room</button></div>
  <input form="crm-project-core-form" name="initial_rooms" type="hidden" value={JSON.stringify(rooms)}/>
  {rooms.length===0?<p className="crm-rooms-empty">No rooms added yet. Click &quot;Add Room&quot; to create one.</p>:
   <div className="crm-rooms-scroll"><table className="contact-table crm-room-table">
    <thead><tr><th>Order</th><th>Room</th><th>Door Style</th><th>Drawer Style</th><th>Species</th><th>Finish</th><th>Construction</th><th>Manufacturer</th><th>Actions</th>{isAdmin&&<th className="crm-room-cost">Cost</th>}</tr></thead>
    <tbody>{rooms.map((room,index)=><Fragment key={index}>
     <tr style={manufacturerRowStyle(manufacturers.find(option=>option.value===room.manufacturer)?.color)}>
      <td>{([-1,1] as const).map(offset=><button key={offset} type="button"
       aria-label={offset<0?"Move room up":"Move room down"} disabled={index+offset<0||index+offset>=rooms.length}
       onClick={()=>setRooms(old=>{
        const reordered=[...old];
        [reordered[index],reordered[index+offset]]=[reordered[index+offset],reordered[index]];
        return reordered;
       })}><ButtonIcon kind={offset<0?"up":"down"}/></button>)}</td>
      <td>{room.room_name}{room.ras_items.length>0&&<small className="crm-jk-cost-locked">Rev-A-Shelf ({room.ras_items.length})</small>}</td>
      <RoomSpecCells specs={room}/>
      <td><button type="button" onClick={()=>open(index)}>Edit<ButtonIcon kind="edit"/></button><button type="button" onClick={()=>setRooms(old=>old.filter((_,i)=>i!==index))}>Delete<ButtonIcon kind="delete"/></button></td>
      {isAdmin&&<td className="crm-room-cost">{currency.format(Number(room.room_cost))}</td>}
     </tr>
     {room.cabinetry_sections.map(section=><tr key={section.id} style={manufacturerRowStyle(manufacturers.find(option=>option.value===section.manufacturer)?.color)}>
      <td/>
      <td><span className="crm-cabinetry-child-name">{section.name}</span></td>
      <RoomSpecCells specs={section}/>
      <td/>
      {isAdmin&&<td className="crm-room-cost">{currency.format(Number(room.section_financials.find(entry=>entry.section_id===section.id)?.room_cost??0))}</td>}
     </tr>)}
    </Fragment>)}</tbody>
   </table></div>}

  {editing!==null&&<div className="crm-room-modal-layer">
   <button type="button" className="crm-room-modal-backdrop" aria-label="Close room editor" onClick={()=>setEditing(null)}><ButtonIcon kind="close" /></button>
   <div className="crm-room-modal crm-new-room-modal" role="dialog" aria-modal="true" aria-labelledby="new-room-title">
    <div className="crm-room-modal-title"><h2 id="new-room-title">{editing===-1?"Add Room":"Edit Room"}</h2><button type="button" aria-label="Close" onClick={()=>setEditing(null)}><ButtonIcon kind="close" /></button></div>
    <div className="crm-new-room-body">
     <div className="crm-new-room-fields">
      <label>Room Name<input autoFocus value={draft.room_name} maxLength={200} onChange={e=>update("room_name",e.target.value)}/></label>
      {isAdmin?<div className="crm-new-room-cost-pair"><label>Room Cost<input type="number" min="0" step="0.01" value={draft.room_cost} onChange={e=>update("room_cost",e.target.value)}/></label><label>Mfr Discount %<input type="number" min="0" max="100" step="0.001" value={draft.manufacturer_discount} onChange={e=>update("manufacturer_discount",e.target.value)}/></label></div>:<div/>}
      {draft.cabinetry_sections.length>0&&<h3 className="crm-cabinetry-primary">{primaryCabinetryLabel}</h3>}
      <label>Door Style<input value={draft.door_style} maxLength={200} onChange={e=>update("door_style",e.target.value)}/></label>
      <label>Species<input value={draft.species} maxLength={200} onChange={e=>update("species",e.target.value)}/></label>
      <label>Drawer Style<input value={draft.drawer_style} maxLength={200} onChange={e=>update("drawer_style",e.target.value)}/></label>
      <label>Finish<input value={draft.finish} maxLength={200} onChange={e=>update("finish",e.target.value)}/></label>
      <label>Construction<select value={draft.construction} onChange={e=>update("construction",e.target.value)}><option value="">Select...</option>{cabinetryConstructions.map(v=><option value={v} key={v}>{v}</option>)}</select></label>
      <label>Manufacturer<select value={draft.manufacturer} onChange={e=>update("manufacturer",e.target.value)}><option value="">Select...</option>{manufacturers.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
     </div>
     <CabinetrySectionEditor sections={draft.cabinetry_sections}
      financials={isAdmin?{
       values:draft.section_financials,
       onChange:entries=>setDraft(old=>({...old,section_financials:entries})),
      }:undefined}
      onChange={sections=>setDraft(old=>({...old,cabinetry_sections:sections}))}
      readPrimary={()=>({
       door_style:draft.door_style, drawer_style:draft.drawer_style, species:draft.species,
       finish:draft.finish, construction:draft.construction, manufacturer:draft.manufacturer,
      })} manufacturers={manufacturers}/>
     <div className="crm-new-room-ras">
      <div className="crm-new-room-ras-heading"><h3><ButtonIcon kind="cabinet"/> Rev-A-Shelf Items ({draft.ras_items.length})</h3><button type="button" onClick={()=>setDraft(d=>({...d,ras_items:[...d.ras_items,{item_name:"",code:"",link:""}]}))}><ButtonIcon kind="add"/>Add Item</button></div>
      {draft.ras_items.length===0&&<p className="crm-new-room-empty">No items added.</p>}
      {draft.ras_items.map((item,i)=><div className="crm-new-room-ras-row" key={i}>
       <input aria-label={`Item ${i+1} Name`} placeholder="Item Name" maxLength={200} value={item.item_name} onChange={e=>setDraft(d=>({...d,ras_items:d.ras_items.map((r,n)=>n===i?{...r,item_name:e.target.value}:r)}))}/>
       <input aria-label={`Item ${i+1} Code`} placeholder="Code" maxLength={100} value={item.code} onChange={e=>setDraft(d=>({...d,ras_items:d.ras_items.map((r,n)=>n===i?{...r,code:e.target.value}:r)}))}/>
       <input aria-label={`Item ${i+1} Link`} placeholder="Link (https://)" type="url" value={item.link} onChange={e=>setDraft(d=>({...d,ras_items:d.ras_items.map((r,n)=>n===i?{...r,link:e.target.value}:r)}))}/>
       <button type="button" aria-label={`Remove item ${i+1}`} onClick={()=>setDraft(d=>({...d,ras_items:d.ras_items.filter((_,n)=>n!==i)}))}>×<ButtonIcon kind="filter" /></button>
      </div>)}
     </div>
     <div className="crm-room-modal-actions"><button type="button" onClick={()=>setEditing(null)}>Cancel<ButtonIcon kind="close" /></button><button type="button" className="crm-new-room-save" disabled={!draft.room_name.trim()||!sectionNamesValid||!sectionCostsValid} onClick={apply}>Save Room<ButtonIcon kind="save" /></button></div>
    </div>
   </div>
  </div>}
 </section>;
}

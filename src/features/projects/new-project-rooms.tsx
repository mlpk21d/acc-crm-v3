"use client";
import { ButtonIcon } from "@/components/button-icon";
import {useState} from "react";
export type DraftRoom={room_name:string;door_style:string;drawer_style:string;species:string;finish:string;construction:string;manufacturer:string;room_cost:string;manufacturer_discount:string;ras_items:{item_name:string;code:string;link:string}[]};
const blank=():DraftRoom=>({room_name:"",door_style:"",drawer_style:"",species:"",finish:"",construction:"",manufacturer:"",room_cost:"0",manufacturer_discount:"0",ras_items:[]});
const constructions=["Inset","Inset Beaded","Full Overlay","Frameless"];
export function NewProjectRooms({manufacturers,isAdmin}:{manufacturers:{value:string;label:string}[];isAdmin:boolean}){
 const [rooms,setRooms]=useState<DraftRoom[]>([]);
 const [editing,setEditing]=useState<number|null>(null);
 const [draft,setDraft]=useState<DraftRoom>(blank());
 const update=(key:keyof DraftRoom,value:string)=>setDraft(old=>({...old,[key]:value}));
 function open(index:number|null){setEditing(index??-1);setDraft(index===null?blank():structuredClone(rooms[index]));}
 function apply(){if(!draft.room_name.trim()||draft.ras_items.some(i=>!i.item_name.trim()||(i.link&&!/^https?:\/\//.test(i.link))))return;setRooms(old=>editing===-1?[...old,draft]:old.map((r,i)=>i===editing?draft:r));setEditing(null)}
 return <section className="content-card crm-project-rooms">
  <div className="crm-rooms-heading"><h2>Rooms ({rooms.length})</h2><button type="button" onClick={()=>open(null)}>+ Add Room<ButtonIcon kind="add" /></button></div>
  <input form="crm-project-core-form" name="initial_rooms" type="hidden" value={JSON.stringify(rooms)}/>
  {rooms.length===0?<p className="crm-rooms-empty">No rooms added yet. Click &quot;Add Room&quot; to create one.</p>:<div className="crm-rooms-scroll"><table className="contact-table"><thead><tr><th>Order</th><th>Room</th><th>Door Style</th><th>Drawer Style</th><th>Species</th><th>Finish</th><th>Construction</th><th>Manufacturer</th>{isAdmin&&<th>Room Cost</th>}<th>Actions</th></tr></thead><tbody>{rooms.map((r,i)=><tr key={i}><td><button type="button" disabled={i===0} onClick={()=>setRooms(old=>{const a=[...old];[a[i-1],a[i]]=[a[i],a[i-1]];return a})}>↑<ButtonIcon kind="up" /></button><button type="button" disabled={i===rooms.length-1} onClick={()=>setRooms(old=>{const a=[...old];[a[i],a[i+1]]=[a[i+1],a[i]];return a})}>↓<ButtonIcon kind="down" /></button></td><td>{r.room_name}{r.ras_items.length>0&&<small className="crm-jk-cost-locked">Rev-A-Shelf ({r.ras_items.length})</small>}</td><td>{r.door_style||"—"}</td><td>{r.drawer_style||"—"}</td><td>{r.species||"—"}</td><td>{r.finish||"—"}</td><td>{r.construction||"—"}</td><td>{r.manufacturer||"—"}</td>{isAdmin&&<td>{r.room_cost}</td>}<td><button type="button" onClick={()=>open(i)}>Edit<ButtonIcon kind="edit" /></button><button type="button" onClick={()=>setRooms(old=>old.filter((_,n)=>n!==i))}>Delete<ButtonIcon kind="delete" /></button></td></tr>)}</tbody></table></div>}
  {editing!==null&&<div className="crm-room-modal-layer">
   <button type="button" className="crm-room-modal-backdrop" aria-label="Close room editor" onClick={()=>setEditing(null)}/>
   <div className="crm-room-modal crm-new-room-modal" role="dialog" aria-modal="true" aria-labelledby="new-room-title">
    <div className="crm-room-modal-title"><h2 id="new-room-title">{editing===-1?"Add Room":"Edit Room"}</h2><button type="button" aria-label="Close" onClick={()=>setEditing(null)}>×<ButtonIcon kind="close" /></button></div>
    <div className="crm-new-room-body">
     <div className="crm-new-room-fields">
      <label>Room Name<input autoFocus value={draft.room_name} maxLength={200} onChange={e=>update("room_name",e.target.value)}/></label>
      {isAdmin?<div className="crm-new-room-cost-pair"><label>Room Cost<input type="number" min="0" step="0.01" value={draft.room_cost} onChange={e=>update("room_cost",e.target.value)}/></label><label>Mfr Discount %<input type="number" min="0" max="100" step="0.001" value={draft.manufacturer_discount} onChange={e=>update("manufacturer_discount",e.target.value)}/></label></div>:<div/>}
      <label>Door Style<input value={draft.door_style} maxLength={200} onChange={e=>update("door_style",e.target.value)}/></label>
      <label>Species<input value={draft.species} maxLength={200} onChange={e=>update("species",e.target.value)}/></label>
      <label>Drawer Style<input value={draft.drawer_style} maxLength={200} onChange={e=>update("drawer_style",e.target.value)}/></label>
      <label>Finish<input value={draft.finish} maxLength={200} onChange={e=>update("finish",e.target.value)}/></label>
      <label>Construction<select value={draft.construction} onChange={e=>update("construction",e.target.value)}><option value="">Select...</option>{constructions.map(v=><option value={v} key={v}>{v}</option>)}</select></label>
      <label>Manufacturer<select value={draft.manufacturer} onChange={e=>update("manufacturer",e.target.value)}><option value="">Select...</option>{manufacturers.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
     </div>
     <div className="crm-new-room-ras">
      <div className="crm-new-room-ras-heading"><h3>◇&nbsp; Rev-A-Shelf Items ({draft.ras_items.length})</h3><button type="button" onClick={()=>setDraft(d=>({...d,ras_items:[...d.ras_items,{item_name:"",code:"",link:""}]}))}>＋ Add Item<ButtonIcon kind="add" /></button></div>
      {draft.ras_items.length===0&&<p className="crm-new-room-empty">No items added.</p>}
      {draft.ras_items.map((item,i)=><div className="crm-new-room-ras-row" key={i}>
       <input aria-label={`Item ${i+1} Name`} placeholder="Item Name" maxLength={200} value={item.item_name} onChange={e=>setDraft(d=>({...d,ras_items:d.ras_items.map((r,n)=>n===i?{...r,item_name:e.target.value}:r)}))}/>
       <input aria-label={`Item ${i+1} Code`} placeholder="Code" maxLength={100} value={item.code} onChange={e=>setDraft(d=>({...d,ras_items:d.ras_items.map((r,n)=>n===i?{...r,code:e.target.value}:r)}))}/>
       <input aria-label={`Item ${i+1} Link`} placeholder="Link (https://)" type="url" value={item.link} onChange={e=>setDraft(d=>({...d,ras_items:d.ras_items.map((r,n)=>n===i?{...r,link:e.target.value}:r)}))}/>
       <button type="button" aria-label={`Remove item ${i+1}`} onClick={()=>setDraft(d=>({...d,ras_items:d.ras_items.filter((_,n)=>n!==i)}))}>×<ButtonIcon kind="filter" /></button>
      </div>)}
     </div>
     <div className="crm-room-modal-actions"><button type="button" onClick={()=>setEditing(null)}>Cancel<ButtonIcon kind="close" /></button><button type="button" className="crm-new-room-save" disabled={!draft.room_name.trim()} onClick={apply}>Save Room<ButtonIcon kind="save" /></button></div>
    </div>
   </div>
  </div>}
 </section>;
}

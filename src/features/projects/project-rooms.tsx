"use client";
import { ButtonIcon } from "@/components/button-icon";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ProjectRoom } from "@/features/projects/rooms-data";
import type { RoomFinancial } from "@/features/projects/financial-data";
import {jkTotalCents,type JkDraft} from "@/features/projects/jk-model";
import { JkConfigurator } from "@/features/projects/jk-configurator";
import { addProjectRoom, deleteProjectRoom, moveProjectRoom, addRoomAccessory, deleteRoomAccessory } from "@/features/projects/rooms-actions";

const fields=[["room_name","Room Name"],["door_style","Door Style"],["species","Species"],["drawer_style","Drawer Style"],["finish","Finish"]] as const;
const construction=["Inset","Inset Beaded","Full Overlay","Frameless"];
export function ProjectRooms({projectId,rooms,manufacturers,canEdit,isAdmin,roomFinancials=[]}:{
 projectId:string;rooms:ProjectRoom[];manufacturers:{value:string;label:string}[];canEdit:boolean;isAdmin:boolean;roomFinancials?:RoomFinancial[];
}) {
 const [current,setCurrent]=useState<ProjectRoom|null|undefined>(undefined);
 const [jkOpen,setJkOpen]=useState(false);
 const [manufacturer,setManufacturer]=useState("");
 const [jkDraft,setJkDraft]=useState<JkDraft|undefined>();
 const [roomError,setRoomError]=useState("");
 const [saving,setSaving]=useState(false);
 function openRoom(room:ProjectRoom|null){setManufacturer(room?.manufacturer??"");setJkDraft(undefined);setRoomError("");setCurrent(room);}
 const [confirmDelete,setConfirmDelete]=useState<ProjectRoom|null>(null);
 const dialog=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(current===undefined||jkOpen) return;
  const esc=(e:KeyboardEvent)=>{if(e.key==="Escape") setCurrent(undefined);};
  document.addEventListener("keydown",esc);
  const focus=dialog.current?.querySelector<HTMLInputElement>("input:not([type=hidden])");
  focus?.focus();
  return ()=>document.removeEventListener("keydown",esc);
 },[current,jkOpen]);
 return <>
  <div className="crm-rooms-heading"><h2><ButtonIcon kind="layers"/>Rooms ({rooms.length})</h2>{canEdit&&<button type="button" onClick={()=>openRoom(null)}><ButtonIcon kind="add"/>Add Room</button>}</div>
  {rooms.length>0&&<div className="crm-rooms-scroll"><table className={`contact-table crm-room-table ${canEdit?"crm-room-table-editable":""}`}><thead><tr>{canEdit&&<th>Order</th>}<th>Room</th><th>Door Style</th><th>Drawer Style</th><th>Species</th><th>Finish</th><th>Construction</th><th>Manufacturer</th>{isAdmin&&<th className="crm-room-cost">Cost</th>}{canEdit&&<th className="crm-room-actions-column">Actions</th>}</tr></thead>
  <tbody>{rooms.map((room,index)=><tr key={room.id} style={{"--room-row-color":/^#[0-9a-f]{6}$/i.test(room.manufacturer_color??"")?room.manufacturer_color!:undefined} as CSSProperties}>
   {canEdit&&<td><div className="crm-room-order-controls">{(["up","down"] as const).map(direction=><form action={moveProjectRoom} key={direction}><input type="hidden" name="project_id" value={projectId}/><input type="hidden" name="id" value={room.id}/><input type="hidden" name="direction" value={direction}/><button type="submit" aria-label={direction==="up"?"Move room up":"Move room down"} disabled={direction==="up"?index===0:index===rooms.length-1}><ButtonIcon kind={direction}/></button></form>)}</div></td>}
   <td><strong>{room.room_name}</strong>{room.ras_items.length>0&&<div className="crm-room-accessory-preview">Rev-A-Shelf ({room.ras_items.length})</div>}</td><td>{room.door_style||"—"}</td><td>{room.drawer_style||"—"}</td><td>{room.species||"—"}</td><td>{room.finish||"—"}</td><td>{room.construction||"—"}</td>
   <td><span>{room.manufacturer||"—"}</span></td>
   {isAdmin&&<td className="crm-room-cost">{new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(roomFinancials.find(r=>r.room_id===room.id)?.room_cost??0))}</td>}
   {canEdit&&<td className="crm-room-actions-column"><div className="crm-room-row-actions"><button type="button" className="crm-room-icon-action" aria-label={`Edit ${room.room_name}`} title="Edit room" onClick={()=>openRoom(room)}><ButtonIcon kind="edit"/></button><button type="button" className="crm-room-icon-action crm-room-delete-action" aria-label={`Delete ${room.room_name}`} title="Delete room" onClick={()=>setConfirmDelete(room)}><ButtonIcon kind="delete"/></button></div></td>}
  </tr>)}</tbody></table></div>}
  {rooms.length===0&&<p className="crm-rooms-empty">{canEdit?<>No rooms added yet. Click &quot;Add Room&quot; to create one.</>:"No rooms added yet."}</p>}
  {current!==undefined&&<div className="crm-room-modal-layer" inert={jkOpen} aria-hidden={jkOpen||undefined}>
   <button type="button" className="crm-room-modal-backdrop" aria-label="Close room editor" onClick={()=>setCurrent(undefined)}><ButtonIcon kind="close" /></button>
   <div className="crm-room-modal" role="dialog" aria-modal="true" aria-labelledby="crm-room-modal-title" ref={dialog}>
    <div className="crm-room-modal-title"><h2 id="crm-room-modal-title">{current?"Edit Room":"Add Room"}</h2><button type="button" onClick={()=>setCurrent(undefined)} aria-label="Close"><ButtonIcon kind="close" /></button></div>
    <form action={async data=>{setSaving(true);setRoomError("");try{await addProjectRoom(data);setCurrent(undefined);}catch{setRoomError("Unable to save room. Check the room details and cabinet selection, then try again.");}finally{setSaving(false)}}} className="crm-room-modal-form">
      {roomError&&<p role="alert" className="contact-form-error">{roomError}</p>}
      {jkDraft&&manufacturer==="J&K"&&<input type="hidden" name="jk_configuration" value={JSON.stringify(jkDraft)}/>}
      <input type="hidden" name="project_id" value={projectId}/>
      <input type="hidden" name="id" value={current?.id??""}/>
      <div className="crm-room-fields">
       <label>Room Name<input name="room_name" maxLength={200} required defaultValue={current?.room_name??""}/></label>
       {isAdmin&&<div className="crm-existing-room-cost-pair">
        <label>Room Cost<input key={`${current?.id??"new"}-${jkDraft?jkTotalCents(jkDraft):"manual"}`} name="room_cost" type="number" min="0" max="99999999" step="0.01" required defaultValue={jkDraft?(jkTotalCents(jkDraft)/100).toFixed(2):roomFinancials.find(r=>r.room_id===current?.id)?.room_cost??"0"} disabled={!!jkDraft||roomFinancials.some(r=>r.room_id===current?.id&&r.jk_locked)}/></label>
        <label>Mfr Discount %<input key={current?.id??"new"} name="manufacturer_discount" type="number" min="0" max="100" step="0.001" required defaultValue={roomFinancials.find(r=>r.room_id===current?.id)?.manufacturer_discount??"0"} disabled={!!jkDraft||roomFinancials.some(r=>r.room_id===current?.id&&r.jk_locked)}/></label>
       </div>}
       {fields.filter(([name])=>name!=="room_name").map(([name,label])=><label key={name}>{label}<input name={name} maxLength={200} required={name==="room_name"} defaultValue={current?.[name]??""}/></label>)}
       <label>Construction<select name="construction" defaultValue={current?.construction??""}><option value="">Select...</option>{construction.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
       <label>Manufacturer<select name="manufacturer" value={manufacturer} onChange={event=>{setManufacturer(event.target.value);setJkDraft(undefined);}}><option value="">Select...</option>{manufacturers.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}{current?.manufacturer&&!manufacturers.some(m=>m.value===current.manufacturer)&&<option value={current.manufacturer}>{current.manufacturer} (inactive)</option>}</select></label>
      </div>
      {isAdmin&&manufacturer==="J&K"&&<button type="button" className="crm-jk-launch" disabled={saving} onClick={()=>setJkOpen(true)}><ButtonIcon kind="cabinet"/>Configure J&amp;K Cabinets</button>}
      {jkDraft&&<p className="crm-jk-draft-notice">Cabinet configuration applied. Save Room to save these cabinets.</p>}
      {current&&<div className="crm-room-accessory-notice">Rev-A-Shelf items: {current.ras_items.length}. Save room changes before managing accessories below.</div>}
      <div className="crm-room-modal-actions"><button type="button" onClick={()=>setCurrent(undefined)}>Cancel<ButtonIcon kind="close" /></button><button type="submit" disabled={saving}>{saving?"Saving…":"Save Room"}<ButtonIcon kind="save" /></button></div>
    </form>
    {current&&<div className="crm-room-ras-section">
      <h3>Rev-A-Shelf Items ({current.ras_items.length})</h3>
      {current.ras_items.map(item=><div className="crm-room-ras-item" key={item.id}><div><strong>{item.item_name}</strong>{item.code&&<span> · {item.code}</span>}{item.link&&<a href={item.link} target="_blank" rel="noopener noreferrer">View</a>}</div>
        <form action={async data=>{await deleteRoomAccessory(data);setCurrent(undefined)}}><input type="hidden" name="project_id" value={projectId}/><input type="hidden" name="room_id" value={current.id}/><input type="hidden" name="id" value={item.id}/><button type="submit" aria-label={"Remove "+item.item_name}>Remove<ButtonIcon kind="delete" /></button></form>
      </div>)}
      <form className="crm-room-ras-add" action={async data=>{await addRoomAccessory(data);setCurrent(undefined)}}>
       <input type="hidden" name="project_id" value={projectId}/><input type="hidden" name="room_id" value={current.id}/>
       <input name="item_name" placeholder="Item Name" aria-label="Item Name" required maxLength={200}/>
       <input name="code" placeholder="Code" aria-label="Code" maxLength={100}/>
       <input name="link" placeholder="Link (https://)" aria-label="Link" type="url"/>
       <button type="submit">Add Item<ButtonIcon kind="save" /></button>
      </form>
    </div>}
   </div>
  </div>}
  {jkOpen&&<JkConfigurator projectId={projectId} roomId={current?.manufacturer==="J&K"?current.id:undefined} initialConfig={jkDraft} onApply={configuration=>{setJkDraft(configuration);setJkOpen(false);}} onClose={()=>setJkOpen(false)}/>}
  {confirmDelete&&<div className="crm-room-modal-layer"><button type="button" className="crm-room-modal-backdrop" aria-label="Cancel room delete" onClick={()=>setConfirmDelete(null)}><ButtonIcon kind="close" /></button><div className="crm-room-modal crm-room-confirm" role="dialog" aria-modal="true"><h2>Delete Room?</h2><p>Delete {confirmDelete.room_name}? This action cannot be undone.</p><form action={async data=>{await deleteProjectRoom(data);setConfirmDelete(null)}}><input type="hidden" name="project_id" value={projectId}/><input type="hidden" name="id" value={confirmDelete.id}/><button type="button" onClick={()=>setConfirmDelete(null)}>Cancel<ButtonIcon kind="delete" /></button><button type="submit">Delete Room<ButtonIcon kind="delete" /></button></form></div></div>}
 </>;
}

"use client";
import { useEffect, useRef, useState } from "react";
import type { ProjectRoom } from "@/features/projects/rooms-data";
import { JkConfigurator } from "@/features/projects/jk-configurator";
import { addProjectRoom, deleteProjectRoom, moveProjectRoom, addRoomAccessory, deleteRoomAccessory } from "@/features/projects/rooms-actions";

const fields=[["room_name","Room Name"],["door_style","Door Style"],["species","Species"],["drawer_style","Drawer Style"],["finish","Finish"]] as const;
const construction=["Inset","Inset Beaded","Full Overlay","Frameless"];
export function ProjectRooms({projectId,rooms,manufacturers,canEdit,isAdmin}:{
 projectId:string;rooms:ProjectRoom[];manufacturers:{value:string;label:string}[];canEdit:boolean;isAdmin:boolean;
}) {
 const [current,setCurrent]=useState<ProjectRoom|null|undefined>(undefined);
 const [jkRoom,setJkRoom]=useState<string|null>(null);
 const [confirmDelete,setConfirmDelete]=useState<ProjectRoom|null>(null);
 const dialog=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(current===undefined) return;
  const esc=(e:KeyboardEvent)=>{if(e.key==="Escape") setCurrent(undefined);};
  document.addEventListener("keydown",esc);
  const focus=dialog.current?.querySelector<HTMLInputElement>("input:not([type=hidden])");
  focus?.focus();
  return ()=>document.removeEventListener("keydown",esc);
 },[current]);
 return <>
  <div className="crm-rooms-heading"><h2>Rooms</h2>{canEdit&&<button type="button" onClick={()=>setCurrent(null)}>+ Add Room</button>}</div>
  {rooms.length>0&&<div className="crm-rooms-scroll"><table className="contact-table"><thead><tr><th>Order</th><th>Room</th><th>Door Style</th><th>Drawer Style</th><th>Species</th><th>Finish</th><th>Construction</th><th>Manufacturer</th>{canEdit&&<th>Actions</th>}</tr></thead>
  <tbody>{rooms.map((room,index)=><tr key={room.id}>
   <td>{canEdit&&<div className="crm-room-order-controls">{(["up","down"] as const).map(direction=><form action={moveProjectRoom} key={direction}><input type="hidden" name="project_id" value={projectId}/><input type="hidden" name="id" value={room.id}/><input type="hidden" name="direction" value={direction}/><button type="submit" aria-label={direction==="up"?"Move room up":"Move room down"} disabled={direction==="up"?index===0:index===rooms.length-1}>{direction==="up"?"↑":"↓"}</button></form>)}</div>}</td>
   <td><strong>{room.room_name}</strong>{room.ras_items.length>0&&<div className="crm-room-accessory-preview">Rev-A-Shelf ({room.ras_items.length})</div>}</td><td>{room.door_style||"—"}</td><td>{room.drawer_style||"—"}</td><td>{room.species||"—"}</td><td>{room.finish||"—"}</td><td>{room.construction||"—"}</td>
   <td><span className="crm-manufacturer-chip" style={{backgroundColor:/^#[0-9a-f]{6}$/i.test(room.manufacturer_color??"")?room.manufacturer_color??undefined:undefined}}>{room.manufacturer||"—"}</span></td>
   {canEdit&&<td><button type="button" className="crm-room-text-action" onClick={()=>setCurrent(room)}>Edit</button><button type="button" className="crm-room-text-action" onClick={()=>setConfirmDelete(room)}>Delete</button></td>}
  </tr>)}</tbody></table></div>}
  {rooms.length===0&&<p className="crm-rooms-empty">No rooms added yet. Click &quot;Add Room&quot; to create one.</p>}
  {current!==undefined&&<div className="crm-room-modal-layer">
   <button type="button" className="crm-room-modal-backdrop" aria-label="Close room editor" onClick={()=>setCurrent(undefined)}/>
   <div className="crm-room-modal" role="dialog" aria-modal="true" aria-labelledby="crm-room-modal-title" ref={dialog}>
    <div className="crm-room-modal-title"><h2 id="crm-room-modal-title">{current?"Edit Room":"Add Room"}</h2><button type="button" onClick={()=>setCurrent(undefined)} aria-label="Close">×</button></div>
    <form action={async data=>{await addProjectRoom(data);setCurrent(undefined)}} className="crm-room-modal-form">
      <input type="hidden" name="project_id" value={projectId}/>
      <input type="hidden" name="id" value={current?.id??""}/>
      <div className="crm-room-fields">
       {fields.map(([name,label])=><label key={name}>{label}<input name={name} maxLength={200} required={name==="room_name"} defaultValue={current?.[name]??""}/></label>)}
       <label>Construction<select name="construction" defaultValue={current?.construction??""}><option value="">Select...</option>{construction.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
       <label>Manufacturer<select name="manufacturer" defaultValue={current?.manufacturer??""}><option value="">Select...</option>{manufacturers.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}{current?.manufacturer&&!manufacturers.some(m=>m.value===current.manufacturer)&&<option value={current.manufacturer}>{current.manufacturer} (inactive)</option>}</select></label>
      </div>
      {current&&isAdmin&&current.manufacturer==="J&K"&&<button type="button" className="crm-jk-launch" onClick={()=>{setCurrent(undefined);setJkRoom(current.id)}}>Configure J&amp;K Cabinets</button>}
      {current&&<div className="crm-room-accessory-notice">Rev-A-Shelf items: {current.ras_items.length}. Save room changes before managing accessories below.</div>}
      <div className="crm-room-modal-actions"><button type="button" onClick={()=>setCurrent(undefined)}>Cancel</button><button type="submit">Save Room</button></div>
    </form>
    {current&&<div className="crm-room-ras-section">
      <h3>Rev-A-Shelf Items ({current.ras_items.length})</h3>
      {current.ras_items.map(item=><div className="crm-room-ras-item" key={item.id}><div><strong>{item.item_name}</strong>{item.code&&<span> · {item.code}</span>}{item.link&&<a href={item.link} target="_blank" rel="noopener noreferrer">View</a>}</div>
        <form action={async data=>{await deleteRoomAccessory(data);setCurrent(undefined)}}><input type="hidden" name="project_id" value={projectId}/><input type="hidden" name="room_id" value={current.id}/><input type="hidden" name="id" value={item.id}/><button type="submit" aria-label={"Remove "+item.item_name}>Remove</button></form>
      </div>)}
      <form className="crm-room-ras-add" action={async data=>{await addRoomAccessory(data);setCurrent(undefined)}}>
       <input type="hidden" name="project_id" value={projectId}/><input type="hidden" name="room_id" value={current.id}/>
       <input name="item_name" placeholder="Item Name" aria-label="Item Name" required maxLength={200}/>
       <input name="code" placeholder="Code" aria-label="Code" maxLength={100}/>
       <input name="link" placeholder="Link (https://)" aria-label="Link" type="url"/>
       <button type="submit">Add Item</button>
      </form>
    </div>}
   </div>
  </div>}
  {jkRoom&&<JkConfigurator projectId={projectId} roomId={jkRoom} onClose={()=>setJkRoom(null)}/>}
  {confirmDelete&&<div className="crm-room-modal-layer"><button type="button" className="crm-room-modal-backdrop" aria-label="Cancel room delete" onClick={()=>setConfirmDelete(null)}/><div className="crm-room-modal crm-room-confirm" role="dialog" aria-modal="true"><h2>Delete Room?</h2><p>Delete {confirmDelete.room_name}? This action cannot be undone.</p><form action={async data=>{await deleteProjectRoom(data);setConfirmDelete(null)}}><input type="hidden" name="project_id" value={projectId}/><input type="hidden" name="id" value={confirmDelete.id}/><button type="button" onClick={()=>setConfirmDelete(null)}>Cancel</button><button type="submit">Delete Room</button></form></div></div>}
 </>;
}

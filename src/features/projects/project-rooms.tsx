"use client";
import { useEffect, useRef, useState } from "react";
import type { ProjectRoom } from "@/features/projects/rooms-data";
import { addProjectRoom, deleteProjectRoom } from "@/features/projects/rooms-actions";

const fields=[["room_name","Room Name"],["door_style","Door Style"],["species","Species"],["drawer_style","Drawer Style"],["finish","Finish"]] as const;
const construction=["Inset","Inset Beaded","Full Overlay","Frameless"];
export function ProjectRooms({projectId,rooms,manufacturers,canEdit}:{
 projectId:string;rooms:ProjectRoom[];manufacturers:{value:string;label:string}[];canEdit:boolean;
}) {
 const [current,setCurrent]=useState<ProjectRoom|null|undefined>(undefined);
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
  <div className="crm-rooms-scroll"><table className="contact-table"><thead><tr><th>Room</th><th>Door Style</th><th>Drawer Style</th><th>Species</th><th>Finish</th><th>Construction</th><th>Manufacturer</th>{canEdit&&<th>Actions</th>}</tr></thead>
  <tbody>{rooms.map(room=><tr key={room.id}>
   <td>{room.room_name}</td><td>{room.door_style||"—"}</td><td>{room.drawer_style||"—"}</td><td>{room.species||"—"}</td><td>{room.finish||"—"}</td><td>{room.construction||"—"}</td>
   <td><span className="crm-manufacturer-chip" style={{backgroundColor:/^#[0-9a-f]{6}$/i.test(room.manufacturer_color??"")?room.manufacturer_color??undefined:undefined}}>{room.manufacturer||"—"}</span></td>
   {canEdit&&<td><button type="button" className="crm-room-text-action" onClick={()=>setCurrent(room)}>Edit</button><button type="button" className="crm-room-text-action" onClick={()=>setConfirmDelete(room)}>Delete</button></td>}
  </tr>)}</tbody></table></div>
  {rooms.length===0&&<p>No rooms added yet.</p>}
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
      <div className="crm-room-modal-actions"><button type="button" onClick={()=>setCurrent(undefined)}>Cancel</button><button type="submit">Save Room</button></div>
    </form>
   </div>
  </div>}
  {confirmDelete&&<div className="crm-room-modal-layer"><button type="button" className="crm-room-modal-backdrop" aria-label="Cancel room delete" onClick={()=>setConfirmDelete(null)}/><div className="crm-room-modal crm-room-confirm" role="dialog" aria-modal="true"><h2>Delete Room?</h2><p>Delete {confirmDelete.room_name}? This action cannot be undone.</p><form action={async data=>{await deleteProjectRoom(data);setConfirmDelete(null)}}><input type="hidden" name="project_id" value={projectId}/><input type="hidden" name="id" value={confirmDelete.id}/><button type="button" onClick={()=>setConfirmDelete(null)}>Cancel</button><button type="submit">Delete Room</button></form></div></div>}
 </>;
}

"use client";
import {useState} from "react";
export type DraftRoom={room_name:string;door_style:string;drawer_style:string;species:string;finish:string;construction:string;manufacturer:string;room_cost:string;manufacturer_discount:string;ras_items:{item_name:string;code:string;link:string}[]};
const blank=():DraftRoom=>({room_name:"",door_style:"",drawer_style:"",species:"",finish:"",construction:"",manufacturer:"",room_cost:"0",manufacturer_discount:"0",ras_items:[]});
const constructions=["Inset","Inset Beaded","Full Overlay","Frameless"];
export function NewProjectRooms({manufacturers,isAdmin}:{manufacturers:{value:string;label:string}[];isAdmin:boolean}){
 const [rooms,setRooms]=useState<DraftRoom[]>([]);
 const [editing,setEditing]=useState<number|null>(null);
 const [draft,setDraft]=useState<DraftRoom>(blank());
 const [rasName,setRasName]=useState("");
 const [rasCode,setRasCode]=useState("");
 const [rasLink,setRasLink]=useState("");
 const update=(key:keyof DraftRoom,value:string)=>setDraft(old=>({...old,[key]:value}));
 function open(index:number|null){setEditing(index??-1);setDraft(index===null?blank():structuredClone(rooms[index]));setRasName("");setRasCode("");setRasLink("")}
 function apply(){if(!draft.room_name.trim())return;setRooms(old=>editing===-1?[...old,draft]:old.map((r,i)=>i===editing?draft:r));setEditing(null)}
 return <section className="content-card crm-project-rooms">
  <div className="crm-rooms-heading"><h2>Rooms ({rooms.length})</h2><button type="button" onClick={()=>open(null)}>+ Add Room</button></div>
  <input form="crm-project-core-form" name="initial_rooms" type="hidden" value={JSON.stringify(rooms)}/>
  {rooms.length===0?<p>No rooms added yet. Click Add Room to create one.</p>:<div className="crm-rooms-scroll"><table className="contact-table"><thead><tr><th>Order</th><th>Room</th><th>Door Style</th><th>Drawer Style</th><th>Species</th><th>Finish</th><th>Construction</th><th>Manufacturer</th>{isAdmin&&<th>Room Cost</th>}<th>Actions</th></tr></thead><tbody>{rooms.map((r,i)=><tr key={i}><td><button type="button" disabled={i===0} onClick={()=>setRooms(old=>{const a=[...old];[a[i-1],a[i]]=[a[i],a[i-1]];return a})}>↑</button><button type="button" disabled={i===rooms.length-1} onClick={()=>setRooms(old=>{const a=[...old];[a[i],a[i+1]]=[a[i+1],a[i]];return a})}>↓</button></td><td>{r.room_name}{r.ras_items.length>0&&<small className="crm-jk-cost-locked">Rev-A-Shelf ({r.ras_items.length})</small>}</td><td>{r.door_style||"—"}</td><td>{r.drawer_style||"—"}</td><td>{r.species||"—"}</td><td>{r.finish||"—"}</td><td>{r.construction||"—"}</td><td>{r.manufacturer||"—"}</td>{isAdmin&&<td>{r.room_cost}</td>}<td><button type="button" onClick={()=>open(i)}>Edit</button><button type="button" onClick={()=>setRooms(old=>old.filter((_,n)=>n!==i))}>Delete</button></td></tr>)}</tbody></table></div>}
  {editing!==null&&<div className="crm-room-modal-layer"><button type="button" className="crm-room-modal-backdrop" aria-label="Close room editor" onClick={()=>setEditing(null)}/><div className="crm-room-modal" role="dialog" aria-modal="true" aria-labelledby="new-room-title"><div className="crm-room-modal-title"><h2 id="new-room-title">{editing===-1?"Add Room":"Edit Room"}</h2><button type="button" onClick={()=>setEditing(null)} aria-label="Close">×</button></div>
   <div className="crm-room-modal-form"><div className="crm-room-fields">{([["room_name","Room Name"],["door_style","Door Style"],["drawer_style","Drawer Style"],["species","Species"],["finish","Finish"]] as const).map(([key,label])=><label key={key}>{label}<input value={draft[key]} maxLength={200} onChange={e=>update(key,e.target.value)}/></label>)}
   <label>Construction<select value={draft.construction} onChange={e=>update("construction",e.target.value)}><option value="">Select...</option>{constructions.map(v=><option value={v} key={v}>{v}</option>)}</select></label>
   <label>Manufacturer<select value={draft.manufacturer} onChange={e=>update("manufacturer",e.target.value)}><option value="">Select...</option>{manufacturers.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
   {isAdmin&&<><label>Room Cost<input type="number" min="0" step="0.01" value={draft.room_cost} onChange={e=>update("room_cost",e.target.value)}/></label><label>Manufacturer Discount (%)<input type="number" min="0" max="100" step="0.001" value={draft.manufacturer_discount} onChange={e=>update("manufacturer_discount",e.target.value)}/></label></>}
   </div><div className="crm-room-ras-section"><h3>Rev-A-Shelf Items ({draft.ras_items.length})</h3>{draft.ras_items.map((item,i)=><div className="crm-room-ras-item" key={i}><span>{item.item_name} {item.code}</span><button type="button" onClick={()=>setDraft(d=>({...d,ras_items:d.ras_items.filter((_,n)=>n!==i)}))}>Remove</button></div>)}
   <div className="crm-room-ras-add"><input aria-label="Accessory Name" placeholder="Item Name" value={rasName} onChange={e=>setRasName(e.target.value)}/><input aria-label="Accessory Code" placeholder="Code" value={rasCode} onChange={e=>setRasCode(e.target.value)}/><input aria-label="Accessory Link" placeholder="Link (https://)" type="url" value={rasLink} onChange={e=>setRasLink(e.target.value)}/><button type="button" onClick={()=>{if(!rasName.trim()||(rasLink&&!/^https?:\/\//.test(rasLink)))return;setDraft(d=>({...d,ras_items:[...d.ras_items,{item_name:rasName.trim(),code:rasCode,link:rasLink}]}));setRasName("");setRasCode("");setRasLink("")}}>Add Item</button></div></div>
   <div className="crm-room-modal-actions"><button type="button" onClick={()=>setEditing(null)}>Cancel</button><button type="button" disabled={!draft.room_name.trim()} onClick={apply}>Save Room</button></div></div></div></div>}
 </section>;
}

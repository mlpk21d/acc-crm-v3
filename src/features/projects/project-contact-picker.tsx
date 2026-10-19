"use client";
import {useEffect,useRef,useState} from "react";
import {Search} from "lucide-react";
type ContactChoice={id:string;label:string};
export function ProjectContactPicker({contacts,initialId,initialName}:{contacts:ContactChoice[];initialId:string;initialName:string}){
 const [id,setId]=useState(initialId);
 const [name,setName]=useState(initialName);
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState("");
 const inputRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(open)inputRef.current?.focus()},[open]);
 const matched=contacts.filter(c=>c.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0,25);
 return <>
  <div className="crm-project-contact-picker">
   <label>Project Contact<input name="project_contact_name" maxLength={200} placeholder="Name or search..." value={name} onChange={e=>{setName(e.target.value);setId("")}}/></label>
   <input type="hidden" name="contact_id" value={id}/>
   <button type="button" className="crm-project-contact-link" onClick={()=>{setQuery("");setOpen(true)}}><Search size={16} aria-hidden="true"/>Link</button>
  </div>
  {open&&<div className="crm-room-modal-layer">
   <button className="crm-room-modal-backdrop" type="button" aria-label="Close contact search" onClick={()=>setOpen(false)}/>
   <div role="dialog" aria-modal="true" aria-labelledby="crm-link-contact-title" className="crm-room-modal crm-link-contact-modal">
    <div className="crm-room-modal-title"><h2 id="crm-link-contact-title">Link CRM Contact</h2><button type="button" onClick={()=>setOpen(false)} aria-label="Close">×</button></div>
    <div className="crm-link-contact-search">
     <input ref={inputRef} type="search" role="combobox" aria-expanded={matched.length>0} aria-controls="crm-contact-options" aria-autocomplete="list" placeholder="Search by name or company..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Escape")setOpen(false);if(e.key==="Enter"&&matched.length){e.preventDefault();setId(matched[0].id);setName(matched[0].label);setOpen(false)}}}/>
     {query.trim()&&<div id="crm-contact-options" className="crm-link-contact-results" role="listbox">
      {matched.length?matched.map(c=><button type="button" role="option" aria-selected={c.id===id} key={c.id} onClick={()=>{setId(c.id);setName(c.label);setOpen(false)}}>{c.label}</button>):<p>No contacts found.</p>}
     </div>}
    </div>
   </div>
  </div>}
 </>;
}

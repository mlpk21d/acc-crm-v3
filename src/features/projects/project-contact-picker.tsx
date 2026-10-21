"use client";
import { ButtonIcon } from "@/components/button-icon";
import {useEffect,useRef,useState} from "react";
type ContactChoice={id:string;label:string;phone:string|null;company:string|null};
export function ProjectContactPicker({contacts,initialId,initialName,initialPhone}:{contacts:ContactChoice[];initialId:string;initialName:string;initialPhone:string}){
 const [id,setId]=useState(initialId);
 const [name,setName]=useState(initialName);
 const [phone,setPhone]=useState(initialPhone);
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState("");
 const selected=contacts.find(c=>c.id===id);
 const inputRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(open)inputRef.current?.focus()},[open]);
 const matched=contacts.filter(c=>`${c.label} ${c.company??""}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,25);
 return <>
  <div className="crm-project-contact-field"><div className="crm-project-contact-picker">
   <label>Project Contact<input name="project_contact_name" maxLength={200} placeholder="Name or search..." value={name} onChange={e=>{setName(e.target.value);setId("");setPhone("")}}/></label>
   <input type="hidden" name="contact_id" value={id}/><input type="hidden" name="project_contact_phone" value={phone}/>
   <button type="button" className="crm-project-contact-link" onClick={()=>{setQuery("");setOpen(true)}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>Link</button>
  </div>
  {(phone||selected?.phone||selected?.company)&&<div className="crm-project-contact-summary">
   {(phone||selected?.phone)&&<a className="crm-project-contact-phone" href={`tel:${phone||selected?.phone}`}>{phone||selected?.phone}</a>}
   {selected&&<small>{[selected.label,selected.company].filter(Boolean).join(" · ")}</small>}
  </div>}
  </div>
  {open&&<div className="crm-room-modal-layer">
   <button className="crm-room-modal-backdrop" type="button" aria-label="Close contact search" onClick={()=>setOpen(false)}><ButtonIcon kind="close" /></button>
   <div role="dialog" aria-modal="true" aria-labelledby="crm-link-contact-title" className="crm-room-modal crm-link-contact-modal">
    <div className="crm-room-modal-title"><h2 id="crm-link-contact-title">Link CRM Contact</h2><button type="button" onClick={()=>setOpen(false)} aria-label="Close"><ButtonIcon kind="close" /></button></div>
    <div className="crm-link-contact-search">
     <input ref={inputRef} type="search" role="combobox" aria-expanded={matched.length>0} aria-controls="crm-contact-options" aria-autocomplete="list" placeholder="Search by name or company..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Escape")setOpen(false);if(e.key==="Enter"&&matched.length){e.preventDefault();setId(matched[0].id);setName(matched[0].label);setPhone(matched[0].phone??"");setOpen(false)}}}/>
     {query.trim()&&<div id="crm-contact-options" className="crm-link-contact-results" role="listbox">
      {matched.length?matched.map(c=><button type="button" role="option" aria-selected={c.id===id} key={c.id} onClick={()=>{setId(c.id);setName(c.label);setPhone(c.phone??"");setOpen(false)}}><span>{c.label}</span>{(c.company||c.phone)&&<small>{[c.company,c.phone].filter(Boolean).join(" · ")}</small>}<ButtonIcon kind="link" /></button>):<p>No contacts found.</p>}
     </div>}
    </div>
   </div>
  </div>}
 </>;
}

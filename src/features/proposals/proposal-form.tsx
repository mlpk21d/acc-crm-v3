'use client';
import Link from 'next/link';
import Image from 'next/image';
import {useActionState,useEffect,useRef,useState} from 'react';
import {ButtonIcon} from '@/components/button-icon';
import {saveProposal} from './actions';
import {depositAmount,depositPercentages,money,maxImageBytes,maxMediaBytes,type Proposal,type ProposalProject,type ProposalMedia} from './model';
type MediaItem=ProposalMedia&{file?:File;preview?:string};
export function ProposalForm({proposal,initialProject,initialMedia=[]}:{proposal?:Proposal;initialProject?:ProposalProject;initialMedia?:ProposalMedia[]}) {
 const [project,setProject]=useState(initialProject);
 const [percentage,setPercentage]=useState(proposal?.deposit_percentage??50);
 const [media,setMedia]=useState<MediaItem[]>(initialMedia);
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [results,setResults]=useState<Pick<ProposalProject,'id'|'name'|'contact'>[]>([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const dialog=useRef<HTMLDialogElement>(null);
 const search=useRef<HTMLInputElement>(null);
 const linkButton=useRef<HTMLButtonElement>(null);
 const upload=useRef<HTMLInputElement>(null);
 const urls=useRef(new Set<string>());
 const [state,action,pending]=useActionState(saveProposal,{error:null});
 useEffect(()=>()=>{urls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
 useEffect(()=>{if(open){dialog.current?.showModal();search.current?.focus();}else{dialog.current?.close();}},[open]);
 useEffect(()=>{
  if(!open)return;
  const controller=new AbortController();
  const timer=setTimeout(async()=>{
   setLoading(true);
   try {const response=await fetch(`/api/proposals/projects?q=${encodeURIComponent(query)}`,{signal:controller.signal});if(!response.ok)throw new Error();setResults(await response.json());}
   catch(e){if(!controller.signal.aborted){setResults([]);setError('Unable to search projects. Please try again.');}void e;}
   finally{if(!controller.signal.aborted)setLoading(false);}
  },200);
  return ()=>{clearTimeout(timer);controller.abort();};
 },[query,open]);
 const close=()=>{setOpen(false);linkButton.current?.focus();};
 async function selectProject(id:string){
  setLoading(true);setError('');
  try{const response=await fetch(`/api/proposals/projects?id=${id}`);if(!response.ok)throw new Error();const selected:ProposalProject=await response.json();if(project?.id!==selected.id)setMedia(previous=>previous.map(item=>({...item,room_id:null})));setProject(selected);close();}
  catch{setError('Unable to load this project. Please try again.');}
  finally{setLoading(false);}
 }
 function addFiles(files:File[]){
  setError('');
  if(!project){setError('Select a project before adding images.');return;}
  if(media.length+files.length>20){setError('You can add up to 20 images.');return;}
  if(files.some(f=>!['image/png','image/jpeg'].includes(f.type)||f.size>maxImageBytes||f.size===0)){setError('Choose PNG or JPEG images up to 10 MB each.');return;}
  if([...media.map(m=>m.file?.size??0),...files.map(f=>f.size)].reduce((a,b)=>a+b,0)>maxMediaBytes){setError('Keep the combined image size at or below 10 MB.');return;}
  setMedia(previous=>[...previous,...files.map(file=>{const preview=URL.createObjectURL(file);urls.current.add(preview);return {id:crypto.randomUUID(),filename:file.name,title:'',room_id:null,is_main:false,file,preview};})]);
 }
 function move(index:number,offset:number){setMedia(previous=>{const next=[...previous];[next[index],next[index+offset]]=[next[index+offset],next[index]];return next;});}
 return <form className="contact-form proposal-form" action={form=>{media.forEach(m=>{if(m.file)form.set(`image_${m.id}`,m.file);});action(form);}}>
  <input type="hidden" name="id" value={proposal?.id??''}/><input type="hidden" name="project_id" value={project?.id??''}/>
  <input type="hidden" name="media" value={JSON.stringify(media.map(m=>({id:m.id,title:m.title,room_id:m.room_id,is_main:m.is_main,fresh:!!m.file})))}/>
  <fieldset disabled={pending} className="proposal-fieldset">
   <section className="crm-form-panel"><h2>Proposal Details</h2><div className="proposal-fields">
    <div className="crm-project-contact-picker"><label>Project Name<input readOnly required value={project?.name??''} placeholder="Select a project"/></label><button ref={linkButton} type="button" className="proposal-button" onClick={()=>{setQuery('');setOpen(true);}}><ButtonIcon kind="search"/>Link</button></div>
    <label>Contact<input readOnly value={project?.contact??''}/></label>
    <label>Price<input readOnly value={project?money(project.price):''}/></label>
    <label>Deposit<input readOnly value={project?money(depositAmount(project.price,percentage)):''}/></label>
    <label>Deposit Percentage<select name="deposit_percentage" value={percentage} onChange={e=>setPercentage(Number(e.target.value))}>{depositPercentages.map(p=><option key={p} value={p}>{p}%</option>)}</select></label>
   </div><label className="proposal-toggle"><input type="checkbox" role="switch" name="show_deposit" defaultChecked={proposal?.show_deposit??true}/>Show Deposit</label><p className="contact-help">Display the deposit amount and percentage on the proposal and PDF.</p><label className="proposal-toggle"><input type="checkbox" role="switch" name="include_room_finishes" defaultChecked={proposal?.include_room_finishes??false}/>Add Room Door Styles and Finishes</label><p className="contact-help">Show room styles, finish, species and manufacturer on room image pages in the PDF.</p></section>
   <section className="crm-form-panel"><h2>Media</h2>
    <div className="proposal-dropzone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(!pending)addFiles(Array.from(e.dataTransfer.files));}}>
     <p>{!project?'Select a project before adding images.':'Drag and drop room renders here'}</p><button type="button" className="proposal-button" disabled={!project} onClick={()=>upload.current?.click()}><ButtonIcon kind="upload"/>Choose Images</button>
     <input ref={upload} type="file" disabled={!project} hidden multiple accept="image/png,image/jpeg" onChange={e=>{addFiles(Array.from(e.target.files??[]));e.target.value='';}}/>
     <p className="contact-help">PNG or JPEG · 10 MB per image · 10 MB total · Up to 20 images</p>
    </div>
    <p className="contact-help">Main Image is optional and may be left without a room. All other images require an enabled room.</p>
    <ol className="proposal-media-list">{media.map((m,index)=><li key={m.id}>
     <Image unoptimized width={280} height={196} src={m.preview??`/api/proposals/${proposal!.id}/media/${m.id}`} alt={m.title||m.filename}/>
     <label><span>{m.filename}</span><input aria-label={`Title for ${m.filename}`} placeholder="Optional title" maxLength={200} value={m.title} onChange={e=>setMedia(previous=>previous.map(item=>item.id===m.id?{...item,title:e.target.value}:item))}/></label>
     <label>Room {!m.is_main&&<span aria-hidden="true">*</span>}<select required={!m.is_main} value={m.room_id??''} onChange={e=>setMedia(previous=>previous.map(item=>item.id===m.id?{...item,room_id:e.target.value||null}:item))}><option value="">{m.is_main?'No room (optional)':'Select a room'}</option>{project?.rooms.map(room=><option key={room.id} value={room.id}>{room.room_name}</option>)}</select></label>
     <label className="proposal-main-choice"><input type="checkbox" checked={m.is_main} onChange={e=>{const checked=e.target.checked;setMedia(previous=>previous.map(item=>({...item,is_main:checked?item.id===m.id:false})));}}/>Main Image</label>
     <div className="proposal-actions"><button type="button" className="proposal-button" disabled={index===0} onClick={()=>move(index,-1)}><ButtonIcon kind="up"/>Up</button><button type="button" className="proposal-button" disabled={index===media.length-1} onClick={()=>move(index,1)}><ButtonIcon kind="down"/>Down</button><button type="button" className="proposal-button" onClick={()=>{if(m.preview){URL.revokeObjectURL(m.preview);urls.current.delete(m.preview);}setMedia(previous=>previous.filter(item=>item.id!==m.id));}}><ButtonIcon kind="delete"/>Remove</button></div>
    </li>)}</ol>
   </section>
   <div className="proposal-actions proposal-save"><Link className="proposal-button" href={proposal?`/proposals/${proposal.id}`:'/proposals'}><ButtonIcon kind="close"/>Cancel</Link><button className="proposal-button proposal-primary" disabled={!project||loading} type="submit"><ButtonIcon kind="save"/>{pending?'Saving…':'Save Proposal'}</button></div>
  </fieldset>
  {(error||state.error)&&<p role="alert" className="contact-form-error">{error||state.error}</p>}
  <dialog ref={dialog} className="proposal-project-dialog" onCancel={close} onClose={()=>setOpen(false)}>
   <div className="page-heading"><h2>Link Project</h2><button type="button" className="proposal-button" onClick={close}><ButtonIcon kind="close"/>Close</button></div>
   <label>Search by Project Name<input ref={search} type="search" value={query} onChange={e=>{setQuery(e.target.value);setResults([]);}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(results.length===1&&!loading)void selectProject(results[0].id);}}}/></label>
   <div className="crm-link-contact-results" aria-live="polite">{loading?<p>Loading projects…</p>:results.length?results.map(p=><button className="proposal-button" type="button" key={p.id} onClick={()=>void selectProject(p.id)}><span>{p.name}<small>{p.contact}</small></span><ButtonIcon kind="link"/></button>):<p>No projects found.</p>}</div>
  </dialog>
 </form>;
}

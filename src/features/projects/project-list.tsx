'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ButtonIcon} from '@/components/button-icon';
import {searchProjects,setProjectFeatured,saveProjectListColumns} from './list-actions';
import {allowedColumns,type ProjectColumn,type ProjectListFilters,type ProjectListResult,type ProjectListRow} from './list-model';

type Props={initial:ProjectListResult;initialFilters:ProjectListFilters;hiddenColumns:ProjectColumn[];admin:boolean;editable:boolean;statuses:{value:string;label:string;color:string|null}[]};
const currency=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
function date(value:string|null){return value?new Date(value.length===10?`${value}T12:00:00Z`:value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}):'—';}
export function ProjectList({initial,initialFilters,hiddenColumns,admin,editable,statuses}:Props){
 const [result,setResult]=useState(initial);
 const [filters,setFilters]=useState(initialFilters);
 const [query,setQuery]=useState(initialFilters.q);
 const [hidden,setHidden]=useState(hiddenColumns);
 const [open,setOpen]=useState(false);
 const [expanded,setExpanded]=useState(true);
 const [draft,setDraft]=useState({status:initialFilters.status,featured:initialFilters.featured});
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [pending,setPending]=useState<string[]>([]);
 const [revision,setRevision]=useState(0);
 const first=useRef(true);
 const request=useRef(0);
 const dialog=useRef<HTMLDialogElement>(null);
 const filterButton=useRef<HTMLButtonElement>(null);
 const preferenceQueue=useRef<Promise<unknown>>(Promise.resolve());
 const columns=allowedColumns(admin);
 const visible=columns.filter(([key])=>key==='project_name'||!hidden.includes(key));
 useEffect(()=>{
  const timer=setTimeout(()=>setFilters(f=>f.q===query?f:{...f,q:query,page:1}),250);
  return ()=>clearTimeout(timer);
 },[query]);
 useEffect(()=>{
  if(first.current){first.current=false;return;}
  const sequence=++request.current;
  let active=true;
  Promise.resolve().then(()=>{if(active){setLoading(true);setError('');}});
  searchProjects(filters).then(data=>{
   if(active&&sequence===request.current){
    setResult(data);
    const pages=Math.max(1,Math.ceil(data.total/15));
    if(filters.page>pages)setFilters(f=>({...f,page:pages}));
   }
  }).catch(()=>{if(active)setError('Unable to load projects. Please try again.');})
   .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[filters,revision]);
 useEffect(()=>{
  if(!open)return;
  const modal=dialog.current;
  const trigger=filterButton.current;
  modal?.showModal();
  const overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  return ()=>{modal?.close();document.body.style.overflow=overflow;trigger?.focus();};
 },[open]);
 function close(){setOpen(false);}
 function toggleColumn(key:ProjectColumn){
  if(key==='project_name')return;
  const next=hidden.includes(key)?hidden.filter(k=>k!==key):[...hidden,key];
  setHidden(next);
  preferenceQueue.current=preferenceQueue.current.catch(()=>undefined).then(async()=>{
   const saved=await saveProjectListColumns(next);
   if(saved.error)setError(saved.error);
  }).catch(()=>setError('Unable to save column preferences. Please try again.'));
 }
 async function feature(project:ProjectListRow){
  setPending(ids=>[...ids,project.id]);setError('');
  const featured=!project.featured;
  setResult(data=>({...data,rows:data.rows.map(row=>row.id===project.id?{...row,featured}:row)}));
  try{
   const saved=await setProjectFeatured(project.id,featured);
   if(saved.error)throw new Error(saved.error);
   setRevision(v=>v+1);
  }catch(e){
   setResult(data=>({...data,rows:data.rows.map(row=>row.id===project.id?{...row,featured:project.featured}:row)}));
   setError(e instanceof Error?e.message:'Unable to save featured project.');
  }finally{setPending(ids=>ids.filter(id=>id!==project.id));}
 }
 function sort(key:ProjectColumn){setFilters(f=>({...f,page:1,sort:key,direction:f.sort===key?(f.direction==='asc'?'desc':'asc'):['profit','total_cost','updated_at'].includes(key)?'desc':'asc'}));}
 function cell(row:ProjectListRow,key:ProjectColumn):ReactNode{
  if(key==='project_name')return <Link className="project-list-name" href={`/projects/${row.id}`}>{row.project_name}</Link>;
  if(key==='project_status')return <span className="project-list-status">{row.status_label.replaceAll('_',' ')}</span>;
  if(key==='drawing_approved')return row.drawing_approved?<span aria-label="Approved"><ButtonIcon kind="check"/></span>:'—';
  if(key==='updated_at'||key.endsWith('_date'))return date(row[key] as string|null);
  if(key==='profit'||key==='total_cost')return currency.format(Number(row[key]??0));
  if(key==='next_step')return statuses.find(s=>s.value===row.next_step)?.label??row.next_step??'—';
  return row[key]||'—';
 }
 const pages=Math.max(1,Math.ceil(result.total/15));
 return <section className="project-list">
  <div className="project-list-toolbar">
   <div><h1>Projects</h1><p aria-live="polite">{result.total} total projects</p></div>
   <div className="project-list-search"><ButtonIcon kind="search"/>
    <input aria-label="Search projects" placeholder="Search projects..." maxLength={100} value={query} onChange={e=>setQuery(e.target.value)}/>
    {query&&<button type="button" aria-label="Clear search" onClick={()=>setQuery('')}><ButtonIcon kind="close"/></button>}
   </div>
   <div className="project-list-tools">
    <button ref={filterButton} type="button" className="project-list-button" onClick={()=>{setDraft({status:filters.status,featured:filters.featured});setOpen(true);}}><ButtonIcon kind="filter"/>Filters{(filters.status||filters.featured)&&<span className="crm-filter-count">{Number(!!filters.status)+Number(filters.featured)}</span>}</button>
    {editable&&<Link className="project-list-button primary" href="/projects/new"><ButtonIcon kind="add"/>New Project</Link>}
   </div>
  </div>
  {error&&<div role="alert" className="project-list-error">{error}<button className="project-list-button" type="button" onClick={()=>setRevision(v=>v+1)}><ButtonIcon kind="reset"/>Retry list</button></div>}
  <div className="project-list-table-wrap" aria-busy={loading}>
   <span role="status" className="project-list-loading">{loading?'Updating projects…':''}</span>
   <table className="project-list-table"><thead><tr><th aria-label="Featured"/>
    {visible.map(([key,label])=><th key={key} aria-sort={filters.sort===key?(filters.direction==='asc'?'ascending':'descending'):'none'} className={['profit','total_cost'].includes(key)?'money':''}><button type="button" onClick={()=>sort(key)}>{label}<ButtonIcon kind={filters.sort===key?(filters.direction==='asc'?'up':'down'):'sort'}/></button></th>)}<th>Actions</th>
   </tr></thead><tbody>{result.rows.map(row=><tr key={row.id} style={{backgroundColor:row.status_color&&/^#[0-9a-f]{6}$/i.test(row.status_color)?`${row.status_color}26`:undefined}}>
    <td><button type="button" className={`project-list-star ${row.featured?'featured':''}`} aria-label={`${row.featured?'Unfeature':'Feature'} ${row.project_name}`} aria-pressed={row.featured} disabled={!editable||loading||pending.includes(row.id)} onClick={()=>feature(row)}><ButtonIcon kind="star" fill={row.featured?'currentColor':'none'}/></button></td>
    {visible.map(([key])=><td key={key} className={['profit','total_cost'].includes(key)?'money':''}>{cell(row,key)}</td>)}
    <td><div className="project-list-row-actions"><Link href={`/projects/${row.id}`} aria-label={`View ${row.project_name}`}><ButtonIcon kind="eye"/></Link>{editable&&<Link href={`/projects/${row.id}/edit`} aria-label={`Edit ${row.project_name}`}><ButtonIcon kind="edit"/></Link>}</div></td>
   </tr>)}{result.rows.length===0&&<tr><td colSpan={visible.length+2} className="project-list-empty">No projects found.</td></tr>}</tbody></table>
  </div>
  {pages>1&&<nav className="project-list-pagination" aria-label="Projects pagination"><span>Page {filters.page} of {pages}</span><div><button type="button" className="project-list-button" disabled={filters.page<=1||loading} onClick={()=>setFilters(f=>({...f,page:f.page-1}))}><ButtonIcon kind="back"/>Previous</button><button type="button" className="project-list-button" disabled={filters.page>=pages||loading} onClick={()=>setFilters(f=>({...f,page:f.page+1}))}>Next<ButtonIcon kind="back" style={{transform:'rotate(180deg)'}}/></button></div></nav>}
  {open&&<dialog ref={dialog} className="project-list-drawer" aria-labelledby="project-filter-title" onCancel={close} onClick={e=>{if(e.target===e.currentTarget){const box=e.currentTarget.getBoundingClientRect();if(e.clientX<box.left)close();}}}>
   <div className="project-list-drawer-layout"><header><h2 id="project-filter-title">Filters</h2><button type="button" aria-label="Close filters" onClick={close}><ButtonIcon kind="close"/></button></header>
    <div className="project-list-filter-body">
     <label>Current Status<select value={draft.status} onChange={e=>setDraft(d=>({...d,status:e.target.value}))}><option value="">All statuses</option>{statuses.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
     <div><p>Show Featured Only</p><button type="button" className={`project-list-button ${draft.featured?'featured':''}`} aria-pressed={draft.featured} onClick={()=>{const featured=!draft.featured;setDraft(d=>({...d,featured}));setFilters(f=>({...f,featured,page:1}));}}><ButtonIcon kind="star" fill={draft.featured?'currentColor':'none'}/>Featured Only: {draft.featured?'On':'Off'}</button></div>
     <div className="project-list-columns"><button type="button" aria-expanded={expanded} aria-controls="project-columns" onClick={()=>setExpanded(v=>!v)}>Column Display<ButtonIcon kind={expanded?'up':'down'}/></button>
      {expanded&&<div id="project-columns">{columns.filter(([key])=>key!=='project_name').map(([key,label])=><label key={key}><button type="button" role="switch" aria-checked={!hidden.includes(key)} aria-label={label} className="project-list-switch" onClick={()=>toggleColumn(key)}><span><ButtonIcon kind={!hidden.includes(key)?'check':'close'}/></span></button>{label}</label>)}</div>}
     </div>
    </div>
    <footer><button type="button" className="project-list-button" onClick={()=>{setFilters(f=>({...f,status:'',featured:false,page:1}));close();}}><ButtonIcon kind="reset"/>Reset</button><button type="button" className="project-list-button primary" onClick={()=>{setFilters(f=>({...f,...draft,page:1}));close();}}><ButtonIcon kind="check"/>Apply</button></footer>
   </div>
  </dialog>}
 </section>;
}

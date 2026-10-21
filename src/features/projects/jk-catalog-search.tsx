'use client';
import {useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';
import {ButtonIcon} from '@/components/button-icon';
import {loadJkSeriesAction,searchJkCatalogAction} from './jk-actions';
import type {JkPriceItem} from './jk-data';
const price=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
export function JkCatalogSearch({onSelect,disabled=false}:{onSelect:(item:JkPriceItem)=>void;disabled?:boolean}){
 const [series,setSeries]=useState(''),[options,setOptions]=useState<string[]>([]);
 const [seriesLoading,setSeriesLoading]=useState(true);
 const [term,setTerm]=useState(''),[results,setResults]=useState<JkPriceItem[]>([]);
 const [open,setOpen]=useState(false),[loading,setLoading]=useState(false);
 const [error,setError]=useState(''),[active,setActive]=useState(-1);
 const [position,setPosition]=useState({top:0,left:0,width:0,maxHeight:250});
 const input=useRef<HTMLInputElement>(null),popup=useRef<HTMLDivElement>(null);
 const listId=useId();
 const visible=open&&!!series&&!!term.trim()&&!disabled;
 useEffect(()=>{
  let live=true;
  loadJkSeriesAction().then(data=>{if(live)setOptions(data);}).catch(()=>{if(live)setError('Unable to load J&K series. Close and reopen the configurator to retry.');}).finally(()=>{if(live)setSeriesLoading(false);});
  return ()=>{live=false;};
 },[]);
 useEffect(()=>{
  if(!series||!term.trim())return;
  let live=true;
  const timer=setTimeout(()=>{
   searchJkCatalogAction(term,series).then(data=>{if(live)setResults(data);}).catch(()=>{if(live)setError('Unable to search cabinet items. Please try again.');}).finally(()=>{if(live)setLoading(false);});
  },250);
  return ()=>{live=false;clearTimeout(timer);};
 },[term,series]);
 useEffect(()=>{
  if(!visible)return;
  function place(){
   const rect=input.current?.getBoundingClientRect();if(!rect)return;
   const below=window.innerHeight-rect.bottom-12;
   const above=below<150&&rect.top>below;
   const maxHeight=Math.min(250,Math.max(80,above?rect.top-12:below));
   setPosition({left:rect.left,width:rect.width,top:above?rect.top-maxHeight-4:rect.bottom+4,maxHeight});
  }
  function outside(event:PointerEvent){const target=event.target as Node;if(!input.current?.contains(target)&&!popup.current?.contains(target))setOpen(false);}
  const frame=requestAnimationFrame(place);
  window.addEventListener('resize',place);window.addEventListener('scroll',place,true);document.addEventListener('pointerdown',outside);
  return ()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);document.removeEventListener('pointerdown',outside);};
 },[visible]);
 function select(item:JkPriceItem){onSelect(item);setTerm('');setResults([]);setOpen(false);setActive(-1);}
 function keyboard(event:KeyboardEvent<HTMLInputElement>){
  if(event.key==='Escape'&&visible){event.preventDefault();event.stopPropagation();setOpen(false);return;}
  if((event.key==='ArrowDown'||event.key==='ArrowUp')&&results.length){
   event.preventDefault();setOpen(true);
   const next=event.key==='ArrowDown'?Math.min(active+1,results.length-1):Math.max(active-1,0);
   setActive(next);document.getElementById(`${listId}-${next}`)?.scrollIntoView({block:'nearest'});
  }
  if(event.key==='Enter'&&visible&&results.length){event.preventDefault();select(results[Math.max(active,0)]);}
 }
 return <>
  <select className="crm-jk-series" aria-label="J&K series" value={series} disabled={disabled||seriesLoading} onChange={event=>{setSeries(event.target.value);setTerm('');setResults([]);setOpen(false);setActive(-1);setError('');}}>
   <option value="">{seriesLoading?'Loading series…':options.length?'Select series…':'No series available'}</option>{options.map(value=><option key={value} value={value}>{value}</option>)}
  </select>
  <div className="crm-jk-item-search"><ButtonIcon kind="search"/>
   <input ref={input} role="combobox" aria-autocomplete="list" aria-expanded={visible} aria-controls={listId} aria-activedescendant={visible&&active>=0?`${listId}-${active}`:undefined} aria-label="Search J&K item code" placeholder={series?'Search item code…':'Select a series first…'} disabled={disabled||!series||seriesLoading} maxLength={100} value={term} onKeyDown={keyboard} onFocus={()=>setOpen(true)} onChange={event=>{setTerm(event.target.value);setResults([]);setLoading(!!event.target.value.trim());setOpen(true);setActive(-1);setError('');}}/>
   {visible&&<div ref={popup} id={listId} role="listbox" aria-label="J&K cabinet search results" className="crm-jk-results" style={position}>
    {loading?<p role="status">Searching…</p>:error?<p role="alert">{error}</p>:results.length?results.map((item,index)=><button type="button" role="option" aria-selected={active===index} tabIndex={-1} id={`${listId}-${index}`} key={item.id} onMouseDown={event=>event.preventDefault()} onClick={()=>select(item)}>
     <span className="crm-jk-result-detail"><span className="crm-jk-result-code"><ButtonIcon kind="add"/>{item.item_code??item.item}</span>{item.description&&<small>{item.description}</small>}</span><span className="crm-jk-result-price">{price.format(Number(item.price))}</span>
    </button>):<p role="status">No matching item codes in {series}.</p>}
   </div>}
  </div>
  {!series&&error&&<span role="alert" className="crm-jk-series-error">{error}</span>}
 </>;
}

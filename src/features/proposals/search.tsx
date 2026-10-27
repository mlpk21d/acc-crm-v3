'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {ButtonIcon} from '@/components/button-icon';
export function ProposalSearch({initialQuery}:{initialQuery:string}){
 const [query,setQuery]=useState(initialQuery);const router=useRouter();const previous=useRef(initialQuery);
 useEffect(()=>{if(query===previous.current)return;const timer=setTimeout(()=>{previous.current=query;router.replace(`/proposals?q=${encodeURIComponent(query)}`,{scroll:false});},250);return()=>clearTimeout(timer);},[query,router]);
 return <form className="contact-search" action="/proposals"><label htmlFor="proposal-search">Search by Project</label><input id="proposal-search" type="search" name="q" maxLength={100} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects…"/><button type="submit"><ButtonIcon kind="search"/>Search</button></form>;
}

import {randomUUID} from 'node:crypto';
import {groupRows,inches,type DoorOrder,type DoorRoom} from './model.ts';
export type PdfText={text:string;x:number;y:number;font:string;height:number};
export type PdfPage={items:PdfText[];height:number};
export function lines(page:PdfPage):string[]{
 const groups:{y:number;items:PdfText[]}[]=[];
 for(const item of page.items){if(!item.text.trim())continue;let line=groups.find(g=>Math.abs(g.y-item.y)<2);if(!line){line={y:item.y,items:[]};groups.push(line);}line.items.push(item);}
 return groups.sort((a,b)=>b.y-a.y).map(g=>g.items.sort((a,b)=>a.x-b.x).map(i=>i.text).join(' ').replace(/\s+/g,' ').trim());
}
export function parseKcd(drawings:PdfPage[],list:PdfPage[],name:string):DoorOrder{
 const locations=new Map<string,Set<string>>();const warnings:string[]=[];
 for(const page of drawings){
  // KCD's page title and cabinet labels share a bold font; dimension labels do not.
  const marker=page.items.find(i=>/Not To Scale/i.test(i.text));
  const title=marker&&page.items.find(i=>i.x<marker.x&&Math.abs(i.y-marker.y)<12&&/\s-\s(?:Back of )?Wall\s+\d+/i.test(i.text));
  if(!title||!/\s-\s(?:Back of )?Wall\s+\d+/i.test(title.text))continue;
  let room=title.text.replace(/\s*-\s*(?:Back of )?Wall\s+\d+.*$/i,'').trim();
  const notes=page.items.filter(i=>i.y<title.y-20).map(i=>i.text);
  if(notes.some(t=>/^Island\s*(?:-\s*)?(Front|Back)?$/i.test(t.trim())))room+=' Island';
  else if(notes.some(t=>/Perimeter/i.test(t)))room+=' Perimeter';
  for(const item of page.items){if(item.y>=title.y-20||item.font!==title.font||!/^\d+$/.test(item.text.trim()))continue;const id=item.text.trim();const rooms=locations.get(id)??new Set<string>();rooms.add(room);locations.set(id,rooms);}
 }
 const rooms=new Map<string,DoorRoom>();let matched=0;
 for(const [pageIndex,page] of list.entries())for(const line of lines(page)){
  if(!/^\d+\)\s*\d+/.test(line))continue;
  const match=line.match(/^((?:\d+\)\s*\d+\s*)+)\s+(\d+)\s+(\d+(?:\s+\d+\/\d+)?|\d+\/\d+|\d+\.\d+)\s*[x×]\s*(\d+(?:\s+\d+\/\d+)?|\d+\/\d+|\d+\.\d+)\s+(.+)$/i);
  if(!match)throw new Error(`Could not read a size-list row on page ${pageIndex+1}: ${line.slice(0,150)}. Export a text PDF from KCD.`);
  const refs=[...match[1].matchAll(/(\d+)\)\s*(\d+)/g)];
  if(refs.reduce((sum,r)=>sum+Number(r[1]),0)!==Number(match[2]))throw new Error(`Quantity does not match unit references: ${line.slice(0,150)}`);
  matched++;
  for(const ref of refs){const candidates=locations.get(ref[2]);const roomName=candidates?.size===1?[...candidates][0]:'Unassigned - review';
   if(roomName==='Unassigned - review')warnings.push(`Unit ${ref[2]}: ${candidates?.size?'conflicting drawing rooms: '+[...candidates].join(', '):'no reliable room label found in drawings'}.`);
   let room=rooms.get(roomName);if(!room){room={id:randomUUID(),name:roomName,style:'',species:'',rows:[]};rooms.set(roomName,room);}
   // SFP is a panel description, not a definitive type. Tall FLAT fronts can be doors.
   const kind=/drawer/i.test(match[5])?'Drawer':/door/i.test(match[5])?'Door':/SFP/i.test(match[5])||inches(match[4])>15?'Door':'Drawer';
   room.rows.push({id:randomUUID(),kind,width:match[3],height:match[4],quantity:Number(ref[1]),numbers:ref[2],source:`List p${pageIndex+1}: ${ref[1]})${ref[2]} ${match[5].trim()}`,reviewed:false});
  }
 }
 if(!matched)throw new Error('No KCD door/front rows found. Upload the text-based Door and Drawer Front Sizes PDF, not a scanned image or native KCD file.');
 warnings.unshift('Verify every room, type, size and quantity against the drawings. SFP and FLAT describe construction; door/drawer types are suggestions.');
 return {name,rooms:[...rooms.values()].map(r=>({...r,rows:groupRows(r.rows)})),warnings:[...new Set(warnings)]};
}

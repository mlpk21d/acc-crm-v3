import PDFDocument from 'pdfkit';
import type {RoomReportRow} from '@/features/projects/reports/rooms-table';
import {depositAmount,money,type Proposal,type ProposalProject} from './model';
import {combinedStyles,groupRoomMedia,mosaicBoxes,type MosaicBox} from './pdf-layout';
export type ProposalPdfMedia={title:string;image_data:Buffer;room_id:string|null;is_main:boolean};
export async function createProposalPdf(proposal:Proposal,project:ProposalProject,rooms:(RoomReportRow&{id:string})[],media:ProposalPdfMedia[]) {
 const doc=new PDFDocument({size:'LETTER',layout:'landscape',margins:{top:36,right:36,bottom:36,left:36},info:{Title:project.name,Author:'ACC CRM'}});
 const chunks:Buffer[]=[];const result=new Promise<Buffer>((resolve,reject)=>{doc.on('data',chunk=>chunks.push(chunk));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject);});
 function text(value:string,x:number,y:number,width:number,size=10,bold=false,height=36,align:'left'|'right'='left') {
  doc.font(bold?'Helvetica-Bold':'Helvetica').fontSize(size).fillColor('#111827').text(value,x,y,{width,height,ellipsis:true,align});
 }
 function image(item:ProposalPdfMedia,box:MosaicBox) {
  const caption=item.title?24:0;
  doc.save().rect(box.x,box.y,box.width,box.height-caption).fill('#f9fafb').restore();
  doc.image(item.image_data,box.x,box.y,{fit:[box.width,box.height-caption],align:'center',valign:'center'});
  if(item.title)text(item.title,box.x,box.y+box.height-caption+5,box.width,9,false,19);
 }
 try {
  text(project.name,36,36,720,25,true,65);
  text(`Created: ${new Date(proposal.created_at).toLocaleDateString('en-US',{timeZone:'America/New_York'})}`,36,122,220);
  text(`Contact: ${project.contact||'—'}`,36,158,220,11,false,80);
  text(`Price: ${money(project.price)}`,36,258,220,13,true);
  text(`Deposit (${proposal.deposit_percentage}%): ${money(depositAmount(project.price,proposal.deposit_percentage))}`,36,300,220,11,false,60);
  const main=media.find(item=>item.is_main)??media[0];
  if(main)image(main,{x:280,y:122,width:476,height:418});
  const groups=groupRoomMedia(media);
  // Project room order first; the legacy unassigned group is retained until edited.
  const ids=[...rooms.map(room=>room.id).filter(id=>groups.has(id)),...Array.from(groups.keys()).filter(id=>!rooms.some(room=>room.id===id))];
  for(const roomId of ids){
   const items=groups.get(roomId)!;
   const room=rooms.find(room=>room.id===roomId);
   for(let start=0;start<items.length;start+=5){
    doc.addPage();
    text(project.name,36,30,360,15,true,40);
    text(`${room?.room_name||'Unassigned room'}${start?' (continued)':''}`,36,76,350,20,true,62);
    if(proposal.include_room_finishes&&room){
     const details=[`Door/Drawer: ${combinedStyles(room.door_style,room.drawer_style)}`,`Finish: ${room.finish?.trim()||'—'}`,`Species: ${room.species?.trim()||'—'}`,`Manufacturer: ${room.manufacturer?.trim()||'—'}`].join('\n');
     text(details,420,30,336,10,false,114,'right');
    }
    const pageItems=items.slice(start,start+5);
    const boxes=mosaicBoxes(pageItems.length,36,158,720,402);
    pageItems.forEach((item,index)=>image(item,boxes[index]));
   }
  }
  doc.end();
 } catch(error){doc.destroy(error instanceof Error?error:new Error('Unable to generate proposal PDF.'));}
 return result;
}

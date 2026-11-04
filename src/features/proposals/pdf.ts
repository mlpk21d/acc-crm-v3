import PDFDocument from 'pdfkit';
import type {RoomReportRow} from '@/features/projects/reports/rooms-table';
import {depositAmount,money,type Proposal,type ProposalProject} from './model';
import {combinedStyles,groupRoomMedia,mosaicBoxes,type MosaicBox} from './pdf-layout';
import {loadProposalLogo,drawProposalLogo} from './pdf-logo';
export type ProposalPdfMedia={title:string;image_data:Buffer;room_id:string|null;is_main:boolean};
export async function createProposalPdf(proposal:Proposal,project:ProposalProject,rooms:(RoomReportRow&{id:string})[],media:ProposalPdfMedia[]) {
 const logo=await loadProposalLogo();
 const doc=new PDFDocument({size:'LETTER',layout:'landscape',margins:{top:36,right:36,bottom:16,left:36},info:{Title:project.name,Author:'ACC CRM'}});
 const chunks:Buffer[]=[];const result=new Promise<Buffer>((resolve,reject)=>{doc.on('data',chunk=>chunks.push(chunk));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject);});
 function text(value:string,x:number,y:number,width:number,size=10,bold=false,height=36,align:'left'|'right'='left') {
  doc.font(bold?'Helvetica-Bold':'Helvetica').fontSize(size).fillColor('#111827').text(value,x,y,{width,height,ellipsis:true,align});
 }
 function image(item:ProposalPdfMedia,box:MosaicBox,caption=true) {
  const captionHeight=caption&&item.title?20:0;
  const source=(doc as PDFKit.PDFDocument&{openImage(source:Buffer):{width:number;height:number}}).openImage(item.image_data);
  const scale=Math.min(box.width/source.width,(box.height-captionHeight)/source.height);
  const width=source.width*scale,height=source.height*scale;
  const x=box.x+(box.width-width)/2;
  const y=caption?box.y:box.y+(box.height-height)/2;
  doc.image(item.image_data,x,y,{width,height});
  if(captionHeight)text(item.title,x,y+height+5,width,8,false,15);
 }
 try {
  const date=new Date(proposal.created_at).toLocaleDateString('en-US',{timeZone:'America/New_York'});
  text(date,620,18,136,8,false,14,'right');
  drawProposalLogo(doc,logo,36,49,225);
  // Align visible text with the SVG artwork (whose viewBox includes top whitespace).
  doc.font('Helvetica-Bold').fontSize(24);
  const titleSize=doc.heightOfString(project.name,{width:466})>32?20:24;
  doc.fontSize(titleSize);
  const titleHeight=Math.min(48,doc.heightOfString(project.name,{width:466}));
  text(project.name,290,62.3,466,titleSize,true,48);
  const pricingY=62.3+titleHeight+5;
  text('PRICE',290,pricingY,140,8,false,12);
  text(money(project.price),290,pricingY+16,140,15,true,22);
  if(proposal.show_deposit){
   text(`DEPOSIT (${proposal.deposit_percentage}%)`,450,pricingY,240,8,false,12);
   text(money(depositAmount(project.price,proposal.deposit_percentage)),450,pricingY+16,240,15,true,22);
  }
  const main=media.find(item=>item.is_main);
  if(main)image(main,{x:36,y:153,width:720,height:435},false);
  const groups=groupRoomMedia(media.filter(item=>!item.is_main||item.room_id!==null));
  // Project room order first; the legacy unassigned group is retained until edited.
  const ids=[...rooms.map(room=>room.id).filter(id=>groups.has(id)),...Array.from(groups.keys()).filter(id=>!rooms.some(room=>room.id===id))];
  for(const roomId of ids){
   const items=groups.get(roomId)!;
   const room=rooms.find(room=>room.id===roomId);
   for(let start=0;start<items.length;start+=5){
    doc.addPage();
    text(room?.room_name||'Unassigned room',36,32,350,start?12:26,!start,start?30:72);
    text(project.name,36,578,570,8,false,14);
    drawProposalLogo(doc,logo,672,571,84);
    if(proposal.include_room_finishes&&room){
     const details=[`Door/Drawer: ${combinedStyles(room.door_style,room.drawer_style)}`,`Finish: ${room.finish?.trim()||'—'}`,`Species: ${room.species?.trim()||'—'}`,`Manufacturer: ${room.manufacturer?.trim()||'—'}`].join('\n');
     text(details,420,30,336,9,false,90,'right');
    }
    const pageItems=items.slice(start,start+5);
    const boxes=mosaicBoxes(pageItems.length,36,130,720,420);
    pageItems.forEach((item,index)=>image(item,boxes[index]));
   }
  }
  doc.end();
 } catch(error){doc.destroy(error instanceof Error?error:new Error('Unable to generate proposal PDF.'));}
 return result;
}

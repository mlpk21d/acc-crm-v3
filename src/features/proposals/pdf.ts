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
  const border=1.5; // 2 CSS pixels at 96 dpi, expressed in PDF points.
  const scale=Math.min((box.width-2*border)/source.width,(box.height-captionHeight-2*border)/source.height);
  const width=source.width*scale,height=source.height*scale;
  const x=box.x+(box.width-width)/2;
  const y=caption?box.y+border:box.y+(box.height-height)/2;
  doc.image(item.image_data,x,y,{width,height});
  doc.save().lineWidth(border).strokeColor('#d1d5db')
   .rect(x-border/2,y-border/2,width+border,height+border).stroke().restore();
  if(captionHeight)text(item.title,x,y+height+border+5,width,8,false,15);
  return x-border;
 }
 try {
  const date=new Date(proposal.created_at).toLocaleDateString('en-US',{timeZone:'America/New_York'});
  text(date,620,18,136,8,false,14,'right');
  const main=media.find(item=>item.is_main);
  const imageLeft=main?image(main,{x:36,y:153,width:720,height:435},false):36;

  // Align visible text with the SVG artwork (whose viewBox includes top whitespace).
  doc.font('Helvetica-Bold').fontSize(24);
  const titleSize=doc.heightOfString(project.name,{width:466})>32?20:24;
  doc.fontSize(titleSize);
  const titleHeight=Math.min(48,doc.heightOfString(project.name,{width:466}));
  // Match the visible logo edge to the main image's outer border, including
  // when a narrow render is centered within the image area.
  const logoInset=11.69*225/266.85;
  const headerLeft=imageLeft-logoInset;
  drawProposalLogo(doc,logo,headerLeft,49,225);
  text(project.name,headerLeft+254,62.3,466,titleSize,true,48);
  const pricingY=62.3+titleHeight+5;
  text('PRICE',headerLeft+254,pricingY,140,8,false,12);
  text(money(project.price),headerLeft+254,pricingY+16,140,15,true,22);
  if(proposal.show_deposit){
   text(`DEPOSIT (${proposal.deposit_percentage}%)`,headerLeft+414,pricingY,240,8,false,12);
   text(money(depositAmount(project.price,proposal.deposit_percentage)),headerLeft+414,pricingY+16,240,15,true,22);
  }
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
     const details=[['Door/Drawer',combinedStyles(room.door_style,room.drawer_style)],['Finish',room.finish?.trim()||'—'],['Species',room.species?.trim()||'—'],['Manufacturer',room.manufacturer?.trim()||'—'],['Construction',room.construction?.trim()||'—']];
     const detailWidth=Math.min(336,Math.max(...details.map(([label,value])=>{
      doc.font('Helvetica-Bold').fontSize(9);
      const labelWidth=doc.widthOfString(`${label}: `);
      return labelWidth+doc.font('Helvetica').widthOfString(value)+12;
     })));
     const detailX=756-detailWidth;
     let detailY=30;
     details.forEach(([label,value])=>{
      doc.font('Helvetica-Bold').fontSize(9);
      const labelWidth=doc.widthOfString(`${label}: `);
      doc.font('Helvetica');
      const rowHeight=Math.min(22,doc.heightOfString(value,{width:detailWidth-labelWidth+.1}));
      text(`${label}:`,detailX,detailY,labelWidth,9,true,rowHeight);
      text(value,detailX+labelWidth,detailY,detailWidth-labelWidth+.1,9,false,rowHeight);
      detailY+=rowHeight;
     });
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

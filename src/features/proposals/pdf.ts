import PDFDocument from 'pdfkit';
import {depositAmount,money,type Proposal,type ProposalProject} from './model';
import {combinedStyles,groupRoomMedia,mosaicBoxes,type MosaicBox} from './pdf-layout';
import {loadProposalLogo,drawProposalLogo} from './pdf-logo';
import {cabinetryComparison,roomCabinetrySections,type ProposalRoomDetails} from './pdf-cabinetry';
export type ProposalPdfMedia={title:string;image_data:Buffer;room_id:string|null;is_main:boolean};
export async function createProposalPdf(proposal:Proposal,project:ProposalProject,rooms:ProposalRoomDetails[],media:ProposalPdfMedia[]) {
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
  const main=media.find(item=>item.is_main);

  // Align visible text with the SVG artwork (whose viewBox includes top whitespace).
  doc.font('Helvetica-Bold').fontSize(24);
  const titleSize=doc.heightOfString(project.name,{width:466})>32?20:24;
  doc.fontSize(titleSize);
  const titleHeight=Math.min(48,doc.heightOfString(project.name,{width:466}));
  const titleWidth=Math.min(466,doc.widthOfString(project.name));
  doc.font('Helvetica-Bold').fontSize(15);
  const priceWidth=doc.widthOfString(money(project.price));
  const depositWidth=doc.widthOfString(money(depositAmount(project.price,proposal.deposit_percentage)));
  doc.font('Helvetica').fontSize(8);
  const depositLabelWidth=doc.widthOfString(`DEPOSIT (${proposal.deposit_percentage}%)`);
  const contentWidth=Math.max(titleWidth,priceWidth,proposal.show_deposit?160+Math.max(depositWidth,depositLabelWidth):0);
  // Center the artwork rather than the logo viewBox's blank left inset.
  const logoInset=11.69*225/266.85;
  const headerLeft=(doc.page.width-(254+contentWidth)-logoInset)/2;
  drawProposalLogo(doc,logo,headerLeft,49,225);
  text(project.name,headerLeft+254,62.3,466,titleSize,true,48);
  const pricingY=62.3+titleHeight+5;
  text('PRICE',headerLeft+254,pricingY,140,8,false,12);
  text(money(project.price),headerLeft+254,pricingY+16,140,15,true,22);
  if(proposal.show_deposit){
   text(`DEPOSIT (${proposal.deposit_percentage}%)`,headerLeft+414,pricingY,240,8,false,12);
   text(money(depositAmount(project.price,proposal.deposit_percentage)),headerLeft+414,pricingY+16,240,15,true,22);
  }
  const notes=proposal.additional_notes?.trim();
  let coverImageY=153;
  if(notes){
   const notesY=Math.max(153,pricingY+38);
   doc.font('Helvetica').fontSize(10).fillColor('#111827');
   const paragraph=notes.replace(/\s+/gu,' ');
   doc.text(paragraph,36,notesY,{width:720,lineGap:2});
   coverImageY=doc.y+12;
  }
  if(main)image(main,{x:36,y:coverImageY,width:720,height:588-coverImageY},false);
  const groups=groupRoomMedia(media.filter(item=>!item.is_main||item.room_id!==null));
  // Project room order first; the legacy unassigned group is retained until edited.
  const ids=[...rooms.filter(room=>groups.has(room.id)||(proposal.include_room_finishes&&room.enabled&&room.cabinetry_sections?.length)).map(room=>room.id),
   ...Array.from(groups.keys()).filter(id=>!rooms.some(room=>room.id===id))];
  for(const roomId of ids){
   const items=groups.get(roomId)??[];
   const room=rooms.find(room=>room.id===roomId);
   const roomName=room?.room_name||'Unassigned room';
   const sections=proposal.include_room_finishes&&room?.cabinetry_sections?.length?roomCabinetrySections(room):[];
   let roomPages=0;
   function addRoomPage(titleWidth:number){
    doc.addPage();
    const first=roomPages++===0;
    text(roomName,36,32,titleWidth,first?26:12,first,first?72:30);
    text(project.name,36,578,570,8,false,14);
    drawProposalLogo(doc,logo,672,571,84);
   }
   const comparison=sections.length?cabinetryComparison(doc,sections.slice(0,2),440):null;
   const compact=comparison&&comparison.height<=170;
   if(comparison&&!compact){
    addRoomPage(720);
    cabinetryComparison(doc,sections.slice(0,2),720).draw(36,112);
   }
   const galleryPages=items.length?Math.ceil(items.length/5):compact?1:0;
   for(let page=0;page<galleryPages;page++){
    addRoomPage(compact&&page===0?260:350);
    let imageTop=130;
    if(compact&&page===0){
     comparison.draw(316,30);
     imageTop=Math.max(imageTop,30+comparison.height+14);
    }
    if(proposal.include_room_finishes&&room&&!sections.length){
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
    const pageItems=items.slice(page*5,page*5+5);
    if(pageItems.length){
     const boxes=mosaicBoxes(pageItems.length,36,imageTop,720,550-imageTop);
     pageItems.forEach((item,index)=>image(item,boxes[index]));
    }
   }
   for(let index=2;index<sections.length;index+=2){
    addRoomPage(720);
    cabinetryComparison(doc,sections.slice(index,index+2),720).draw(36,80);
   }
  }
  doc.end();
 } catch(error){doc.destroy(error instanceof Error?error:new Error('Unable to generate proposal PDF.'));}
 return result;
}

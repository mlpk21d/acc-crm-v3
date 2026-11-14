import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {PDFDocument,StandardFonts,rgb,type PDFFont,type PDFPage} from 'pdf-lib';
import {groupRows,type DoorOrder} from './model.ts';
function fit(page:PDFPage,font:PDFFont,text:string,x:number,top:number,width:number,size=11){
 const safe=text.replace(/[^\x20-\x7e\u00a0-\u00ff]/g,'?');
 const scaled=Math.min(size,width/Math.max(1,font.widthOfTextAtSize(safe,1)));
 page.drawText(safe,{x,y:792-top-size,font,size:scaled,color:rgb(0,0,0)});
}
export async function doorOrderPdf(order:DoorOrder):Promise<Buffer>{
 const template=await readFile(path.join(process.cwd(),'src/features/door-orders/templates/door-order-form.pdf'));
 const source=await PDFDocument.load(template);const doc=await PDFDocument.create();const font=await doc.embedFont(StandardFonts.Helvetica);
 for(const room of order.rooms){const grouped=groupRows(room.rows);const doors=grouped.filter(r=>r.kind==='Door'),drawers=grouped.filter(r=>r.kind==='Drawer');const pages=Math.max(1,Math.ceil(Math.max(doors.length,drawers.length)/20));
 for(let n=0;n<pages;n++){
 const [page]=await doc.copyPages(source,[0]);doc.addPage(page);
 fit(page,font,order.name,101,70,205);fit(page,font,room.style,105,117,200);fit(page,font,room.species,107,161,198);
 fit(page,font,room.name,411,146,162);fit(page,font,`Room page ${n+1} of ${pages}`,350,171,220,9);
 fit(page,font,'See attached unit reference list.',350,196,220,9);
 for(const [side,rows] of [doors,drawers].entries())for(let i=0;i<20;i++){
 const row=rows[n*20+i];if(!row)continue;const offset=side*265.5;const top=375+i*17.672;
 fit(page,font,String(row.quantity),99+offset,top,35,10);fit(page,font,`${row.width} x ${row.height}`,162+offset,top,145,10);
 }
 }
 let page:PDFPage;let y=0;
 const start=()=>{page=doc.addPage([612,792]);fit(page,font,`${order.name} - ${room.name}`,36,30,540,14);fit(page,font,'Unit References - Door Order Form',36,56,540,11);y=90;};start();
 for(const kind of ['Door','Drawer'] as const){let number=0;for(const row of grouped.filter(r=>r.kind===kind)){number++;const prefix=`${kind} ${number} | Qty ${row.quantity} | ${row.width} x ${row.height} | Units: `;const words=(prefix+row.numbers).split(' ');let line='';for(const word of words){if(font.widthOfTextAtSize(`${line} ${word}`,10)>530){if(y>735)start();fit(page!,font,line,36,y,540,10);y+=16;line=word;}else line+=(line?' ':'')+word;}if(y>735)start();fit(page!,font,line,36,y,540,10);y+=24;}}
 }
 return Buffer.from(await doc.save());
}

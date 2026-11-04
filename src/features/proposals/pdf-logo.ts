import {readFile} from 'node:fs/promises';
import path from 'node:path';
import type PDFKit from 'pdfkit';
export async function loadProposalLogo(){
 return readFile(path.join(process.cwd(),'public/images/acc-logo.svg'),'utf8');
}
/** Draw the supplied path/polygon logo as vectors, preserving its aspect ratio. */
export function drawProposalLogo(doc:PDFKit.PDFDocument,svg:string,x:number,y:number,width:number){
 doc.save().translate(x,y).scale(width/266.85).fillColor('#111827');
 for(const shape of svg.matchAll(/<(path|polygon)\b[^>]*>/g)){
  if(shape[1]==='path'){
   const d=shape[0].match(/\bd="([^"]+)"/)?.[1];if(d)doc.path(d).fill();
  }else{
   const points=shape[0].match(/\bpoints="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number)??[];
   if(points.length>=6){doc.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)doc.lineTo(points[i],points[i+1]);doc.closePath().fill();}
  }
 }
 doc.restore();
}

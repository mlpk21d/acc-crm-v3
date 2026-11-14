import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
import type {PdfPage} from './parse';
export async function readPdf(bytes:Uint8Array):Promise<PdfPage[]>{
 if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw new Error('Choose valid PDF files.');
 const task=getDocument({data:bytes,useSystemFonts:true});
 try{const doc=await task.promise;if(doc.numPages>100)throw new Error('PDFs may contain at most 100 pages.');const pages:PdfPage[]=[];
 for(let n=1;n<=doc.numPages;n++){const page=await doc.getPage(n);const text=await page.getTextContent();pages.push({height:page.getViewport({scale:1}).height,items:text.items.flatMap(item=>'str' in item?[{text:item.str,x:item.transform[4],y:item.transform[5],font:item.fontName,height:item.height}]:[])});}
 return pages;}finally{await task.destroy();}
}

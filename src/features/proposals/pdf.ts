import PDFDocument from 'pdfkit';
import {drawRoomsTable,type RoomReportRow} from '@/features/projects/reports/rooms-table';
import {depositAmount,money,type Proposal,type ProposalProject} from './model';
export async function createProposalPdf(proposal:Proposal,project:ProposalProject,rooms:RoomReportRow[],media:{title:string;image_data:Buffer}[]) {
 const doc=new PDFDocument({size:'LETTER',margins:{top:40,right:36,bottom:55,left:36},info:{Title:`${project.name} | Proposal`,Author:'ACC CRM'}});
 const chunks:Buffer[]=[];const result=new Promise<Buffer>((resolve,reject)=>{doc.on('data',chunk=>chunks.push(chunk));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject);});
 doc.font('Helvetica-Bold').fontSize(20).fillColor('#111827').text('Proposal');doc.moveDown(.5);
 doc.fontSize(16).text(project.name,{width:540});doc.moveDown();
 doc.font('Helvetica').fontSize(10).fillColor('#374151');
 doc.text(`Created: ${new Date(proposal.created_at).toLocaleDateString('en-US',{timeZone:'America/New_York'})}`);doc.moveDown();
 doc.text(`Contact: ${project.contact||'—'}`,{width:540});doc.moveDown();
 doc.text(`Price: ${money(project.price)}`);doc.moveDown(.5);
 doc.text(`Deposit (${proposal.deposit_percentage}%): ${money(depositAmount(project.price,proposal.deposit_percentage))}`);
 if(proposal.include_room_finishes){doc.moveDown(2);drawRoomsTable(doc,rooms,doc.y);}
 for(const item of media){doc.addPage();if(item.title){doc.font('Helvetica-Bold').fontSize(14).fillColor('#111827').text(item.title,{width:540});doc.moveDown();}const top=doc.y;doc.image(item.image_data,36,top,{fit:[540,Math.max(100,737-top)],align:'center',valign:'center'});}
 doc.end();return result;
}

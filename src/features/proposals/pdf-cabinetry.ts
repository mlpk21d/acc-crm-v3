import type PDFKit from "pdfkit";
import type {RoomReportRow} from "../projects/reports/rooms-table";
import {primaryCabinetryLabel,type CabinetrySection} from "../projects/cabinetry-sections";
import {combinedStyles} from "./pdf-layout";

export type ProposalRoomDetails = RoomReportRow & {
 id: string;
 cabinetry_sections?: CabinetrySection[];
};

export function roomCabinetrySections(room: ProposalRoomDetails) {
 return [
  {...room,name:primaryCabinetryLabel},
  ...(room.cabinetry_sections ?? []),
 ];
}

type CabinetryColumn = ReturnType<typeof roomCabinetrySections>[number];

export function cabinetryComparison(doc: PDFKit.PDFDocument, sections: CabinetryColumn[], width: number) {
 const labels = ["", "Door / Drawer", "Finish", "Species", "Manufacturer", "Construction"];
 const columns = sections.map(section=>[
  section.name, combinedStyles(section.door_style,section.drawer_style),
  section.finish, section.species, section.manufacturer, section.construction,
 ]);
 const labelWidth = 80;
 const columnWidth = (width-labelWidth)/sections.length;
 const cellWidth = columnWidth-12;
 const rows = labels.map((label,index)=>{
  const values = columns.map(column=>column[index]?.trim().replace(/\s+/gu," ") || "—");
  doc.font(index===0?"Helvetica-Bold":"Helvetica").fontSize(9);
  const height = Math.max(...values.map(value=>doc.heightOfString(value,{width:cellWidth})))+5;
  return {label,values,height};
 });

 return {
  height: rows.reduce((sum,row)=>sum+row.height,0),
  draw(x:number,y:number){
   for(const [index,row] of rows.entries()){
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827");
    if(row.label)doc.text(row.label,x,y,{width:labelWidth-6});
    doc.font(index===0?"Helvetica-Bold":"Helvetica");
    row.values.forEach((value,column)=>{
     doc.text(value,x+labelWidth+column*columnWidth,y,{width:cellWidth});
    });
    y+=row.height;
    if(index===0)doc.save().strokeColor("#d1d5db").lineWidth(.5)
     .moveTo(x,y-3).lineTo(x+width,y-3).stroke().restore();
   }
  },
 };
}

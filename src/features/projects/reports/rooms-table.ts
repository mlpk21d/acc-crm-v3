import type PDFKit from "pdfkit";

/** Deliberately excludes all financial fields. Shared by room and project reports. */
export type RoomReportRow = {
  room_name: string;
  door_style: string | null;
  drawer_style: string | null;
  species: string | null;
  finish: string | null;
  construction: string | null;
  manufacturer: string | null;
};

export const roomReportColumns = [
  { key: "room_name", label: "Room", width: 0.20 },
  { key: "door_style", label: "Door Style", width: 0.11 },
  { key: "drawer_style", label: "Drawer Style", width: 0.12 },
  { key: "species", label: "Species", width: 0.14 },
  { key: "finish", label: "Finish", width: 0.17 },
  { key: "construction", label: "Construction", width: 0.13 },
  { key: "manufacturer", label: "Manufacturer", width: 0.13 },
] as const;

export function roomReportCells(room: RoomReportRow): string[] {
  return roomReportColumns.map(({ key }) => room[key]?.trim() || "—");
}

/** Appends the section to any PDF document; owns wrapping and repeated table headers. */
export function drawRoomsTable(doc: PDFKit.PDFDocument, rooms: readonly RoomReportRow[], startY = doc.y): number {
  const left = doc.page.margins.left;
  const width = doc.page.width - left - doc.page.margins.right;
  const widths = roomReportColumns.map(column => width * column.width);
  const bottom = () => doc.page.height - doc.page.margins.bottom;
  const padding = 8;
  const fontSize = 8;
  let y = startY;

  function heading(continued = false) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8")
      .text(`ROOMS (${rooms.length})${continued ? " - CONTINUED" : ""}`, left, y, { width });
    y = doc.y + 8;
    doc.rect(left, y, width, 25).fill("#0f172a");
    let x = left;
    roomReportColumns.forEach((column, index) => {
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#ffffff")
        .text(column.label, x + padding, y + 8, { width: widths[index] - padding * 2, lineBreak: false });
      x += widths[index];
    });
    y += 25;
  }

  if (y + 85 > bottom()) { doc.addPage(); y = doc.page.margins.top; }
  heading();
  if (!rooms.length) {
    doc.font("Helvetica").fontSize(9).fillColor("#475569")
      .text("No rooms added yet.", left + padding, y + 12, { width: width - padding * 2 });
    y = doc.y + 12;
  }
  rooms.forEach((room, rowIndex) => {
    const cells = roomReportCells(room);
    const heights = cells.map((value, index) => {
      doc.font(index === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize);
      return doc.heightOfString(value, { width: widths[index] - padding * 2, lineGap: 2 });
    });
    const height = Math.max(26, ...heights.map(value => value + padding * 2));
    if (y + height > bottom()) { doc.addPage(); y = doc.page.margins.top; heading(true); }
    let x = left;
    cells.forEach((value, index) => {
      doc.rect(x, y, widths[index], height).fillAndStroke(rowIndex % 2 ? "#f1f5f9" : "#ffffff", "#dbe3ee");
      doc.font(index === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize)
        .fillColor(index === 0 ? "#0f172a" : "#475569")
        .text(value, x + padding, y + padding, { width: widths[index] - padding * 2, lineGap: 2 });
      x += widths[index];
    });
    y += height;
  });
  doc.x = left;
  doc.y = y + 16;
  return doc.y;
}

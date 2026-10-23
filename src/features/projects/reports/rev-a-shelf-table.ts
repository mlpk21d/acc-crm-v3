import type PDFKit from "pdfkit";
import type { ProjectRoom } from "../rooms-data";

export type AccessoryReportRoom = Pick<ProjectRoom, "room_name" | "enabled" | "ras_items">;

/** Keeps saved room/item order and follows the report's enabled-room policy. */
export function revAShelfReportRows(rooms: readonly AccessoryReportRoom[]) {
  return rooms.filter(room => room.enabled).flatMap(room => room.ras_items.map(item => ({
    room_name: room.room_name, item_name: item.item_name, code: item.code, link: item.link,
  })));
}

/** Reusable nonfinancial table; input is ordered by room and accessory sort order. */
export function drawRevAShelfTable(doc: PDFKit.PDFDocument, rooms: readonly AccessoryReportRoom[], startY = doc.y) {
  const rows = revAShelfReportRows(rooms);
  const left = doc.page.margins.left;
  const width = doc.page.width - left - doc.page.margins.right;
  const columns = ["Room", "Item Name", "Code", "Link"];
  const widths = [0.20, 0.28, 0.16, 0.36].map(w => w * width);
  const padding = 8;
  let y = startY;
  function header(continued = false) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8")
      .text(`Rev-A-Shelf Items${continued ? " - CONTINUED" : ""}`, left, y, { width });
    y = doc.y + 8;
    doc.rect(left, y, width, 25).fill("#e5e7eb");
    let x = left;
    columns.forEach((label, index) => {
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#374151")
        .text(label, x + padding, y + 8, { width: widths[index] - 2 * padding, lineBreak: false });
      x += widths[index];
    });
    y += 25;
  }
  if (y + 85 > doc.page.height - doc.page.margins.bottom) { doc.addPage(); y = doc.page.margins.top; }
  header();
  if (!rows.length) {
    doc.font("Helvetica").fontSize(9).fillColor("#475569")
      .text("No Rev-A-Shelf items.", left + padding, y + 12, { width: width - 2 * padding });
    y = doc.y + 12;
  }
  for (const [rowIndex, row] of rows.entries()) {
    const cells = [row.room_name, row.item_name, row.code, row.link].map(value => value?.trim() || "—");
    const safeLink = row.link && /^https?:\/\//i.test(row.link) ? row.link : undefined;
    // Split unusually long values and URLs over pages, preserving every character.
    const lines = cells.map((text, index) => {
      doc.font(index === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(8);
      const result: string[] = [];
      for (const paragraph of text.split(/\r?\n/)) {
        let line = "";
        for (const char of paragraph) {
          if (line && doc.widthOfString(line + char) > widths[index] - 2 * padding) {
            const space = line.lastIndexOf(" ");
            if (space > 0) { result.push(line.slice(0, space)); line = line.slice(space + 1); }
            else { result.push(line); line = ""; }
          }
          line += char;
        }
        result.push(line);
      }
      return result;
    });
    let offset = 0;
    const total = Math.max(...lines.map(cell => cell.length));
    const fullRowHeight = total * 11 + 2 * padding;
    const freshPageCapacity = doc.page.height - doc.page.margins.top - doc.page.margins.bottom - 50;
    if (fullRowHeight <= freshPageCapacity && y + fullRowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage(); y = doc.page.margins.top; header(true);
    }
    while (offset < total) {
      const available = Math.floor((doc.page.height - doc.page.margins.bottom - y - 2 * padding) / 11);
      if (available < 1) { doc.addPage(); y = doc.page.margins.top; header(true); continue; }
      const count = Math.min(available, total - offset);
      const height = count * 11 + 2 * padding;
      let x = left;
      lines.forEach((cell, index) => {
        doc.rect(x, y, widths[index], height).fillAndStroke(rowIndex % 2 ? "#f1f5f9" : "#ffffff", "#dbe3ee");
        doc.font(index === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(8).fillColor(index === 0 ? "#0f172a" : "#475569");
        const segment = cell.slice(offset, offset + count);
        segment.forEach((line, lineIndex) => doc.text(line, x + padding, y + padding + lineIndex * 11,
          { width: widths[index] - 2 * padding, lineBreak: false, link: index === 3 ? safeLink : undefined }));
        x += widths[index];
      });
      y += height;
      offset += count;
    }
  }
  doc.y = y + 16;
  doc.x = left;
  return doc.y;
}

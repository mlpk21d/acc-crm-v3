import type PDFKit from "pdfkit";

export type JkReportRow = {
  room_id: string; room_name: string; item: string; description: string | null;
  hinge_direction: string; quantity: number; custom: boolean;
  catalog_series: string | null; catalog_item_code: string | null;
};

export function jkReportCells(row: JkReportRow): string[] {
  // Prefer the saved label over a mutable catalog; also support legacy SERIES//ITEM labels.
  const saved = row.custom ? null : row.item.match(/^(.+?)\s*\/\s*\/\s*(.+)$/)
    ?? row.item.match(/^(.+?)\s+\/\s+(.+?)\s+\/\s+Tier\s+.+$/i);
  return [row.room_name, saved?.[1]?.trim() || row.catalog_series || "—",
    saved?.[2]?.trim() || (row.custom ? row.item : row.catalog_item_code || row.item),
    row.hinge_direction || "—", row.description || "—", String(row.quantity)];
}

/** Reusable nonfinancial table; input is ordered by room and cabinet sort order. */
export function drawJkCabinetTable(doc: PDFKit.PDFDocument, rows: readonly JkReportRow[], startY = doc.y) {
  const left = doc.page.margins.left;
  const width = doc.page.width - left - doc.page.margins.right;
  const columns = ["Room", "Series", "Item", "Hinge", "Description", "Qty"];
  const widths = [0.19, 0.09, 0.19, 0.08, 0.38, 0.07].map(w => w * width);
  const padding = 7;
  let y = startY;
  function header() {
    doc.rect(left, y, width, 25).fill("#0f172a");
    let x = left;
    columns.forEach((label, index) => {
      doc.font("Helvetica-Bold").fontSize(8).fillColor("white")
        .text(label, x + padding, y + 8, { width: widths[index] - 2 * padding, lineBreak: false });
      x += widths[index];
    });
    y += 25;
  }
  header();
  let group = -1;
  let previousRoom = "";
  for (const row of rows) {
    if (row.room_id !== previousRoom) { group++; previousRoom = row.room_id; }
    const cells = jkReportCells(row);
    // Split unusually long descriptions over pages, preserving every character.
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
    const freshPageCapacity = doc.page.height - doc.page.margins.top - doc.page.margins.bottom - 25;
    if (fullRowHeight <= freshPageCapacity && y + fullRowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage(); y = doc.page.margins.top; header();
    }
    while (offset < total) {
      const available = Math.floor((doc.page.height - doc.page.margins.bottom - y - 2 * padding) / 11);
      if (available < 1) { doc.addPage(); y = doc.page.margins.top; header(); continue; }
      const count = Math.min(available, total - offset);
      const height = count * 11 + 2 * padding;
      let x = left;
      lines.forEach((cell, index) => {
        doc.rect(x, y, widths[index], height).fillAndStroke(group % 2 ? "#f1f5f9" : "#ffffff", "#dbe3ee");
        doc.font(index === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(8).fillColor("#0f172a");
        const segment = cell.slice(offset, offset + count);
        segment.forEach((line, lineIndex) => doc.text(line, x + padding, y + padding + lineIndex * 11,
          { width: widths[index] - 2 * padding, lineBreak: false }));
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

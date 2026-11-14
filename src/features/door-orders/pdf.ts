import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage} from 'pdf-lib';
import {groupRows, type DoorOrder} from './model.ts';

const rowsPerForm = 20;

function fit(page: PDFPage, font: PDFFont, text: string, x: number, top: number, width: number, size = 11) {
 const safe = text.replace(/[^\x20-\x7e\u00a0-\u00ff]/g, '?');
 const scaled = Math.min(size, width / Math.max(1, font.widthOfTextAtSize(safe, 1)));
 page.drawText(safe, {x, y: page.getHeight() - top - size, font, size: scaled, color: rgb(0, 0, 0)});
}

export async function doorOrderPdf(order: DoorOrder): Promise<Buffer> {
 const template = await readFile(path.join(process.cwd(), 'src/features/door-orders/templates/door-order-form.pdf'));
 const source = await PDFDocument.load(template);
 const doc = await PDFDocument.create();
 const font = await doc.embedFont(StandardFonts.Helvetica);

 for (const room of order.rooms) {
  const grouped = groupRows(room.rows);
  const doors = grouped.filter(row => row.kind === 'Door');
  const drawers = grouped.filter(row => row.kind === 'Drawer');
  const pageCount = Math.max(1, Math.ceil(Math.max(doors.length, drawers.length) / rowsPerForm));

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
   const [page] = await doc.copyPages(source, [0]);
   doc.addPage(page);
   fit(page, font, order.name, 101, 70, 205);
   fit(page, font, room.style, 105, 117, 200);
   fit(page, font, room.species, 107, 161, 198);
   fit(page, font, room.name, 411, 146, 162);
   fit(page, font, `Room page ${pageIndex + 1} of ${pageCount}`, 350, 171, 220, 9);

   const start = pageIndex * rowsPerForm;
   for (const [column, rows] of [doors, drawers].entries()) {
    const offset = column * 265.5;
    for (const [index, row] of rows.slice(start, start + rowsPerForm).entries()) {
     const top = 375 + index * 17.672;
     const units = row.numbers.split(',').map(number => number.trim()).join(', ');
     fit(page, font, String(row.quantity), 99 + offset, top, 35, 10);
     fit(page, font, `(${units})   ${row.width} x ${row.height}`, 148 + offset, top, 159, 10);
    }
   }
  }
 }
 return Buffer.from(await doc.save());
}

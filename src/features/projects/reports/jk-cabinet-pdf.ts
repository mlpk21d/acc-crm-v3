import PDFDocument from "pdfkit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { drawJkCabinetTable, type JkReportRow } from "./jk-cabinet-table";

export function jkCabinetFilename(projectName: string) {
  const name = projectName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "Project";
  return `${name}-JK-Cabinets.pdf`;
}

export async function createJkCabinetPdf(projectName: string, rows: readonly JkReportRow[], date = new Date()) {
  const svg = await readFile(path.join(process.cwd(), "public/images/acc-logo.svg"), "utf8");
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 40, bottom: 55, left: 36, right: 36 }, bufferPages: true,
    info: { Title: `${projectName} | J&K Cabinet List`, Author: "ACC CRM" } });
  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  // The repository logo consists solely of filled paths and polygons. Draw its
  // original geometry directly so the supplied SVG remains sharp in the PDF.
  doc.save().translate(36, 32).scale(0.8).fillColor("#111827");
  for (const shape of svg.matchAll(/<(path|polygon)\b[^>]*>/g)) {
    if (shape[1] === "path") {
      const d = shape[0].match(/\bd="([^"]+)"/)?.[1];
      if (d) doc.path(d).fill();
    } else {
      const points = shape[0].match(/\bpoints="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number) ?? [];
      if (points.length >= 6) {
        doc.moveTo(points[0], points[1]);
        for (let i = 2; i < points.length; i += 2) doc.lineTo(points[i], points[i + 1]);
        doc.closePath().fill();
      }
    }
  }
  doc.restore();
  const generated = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "America/New_York" });
  doc.font("Helvetica-Bold").fontSize(18).fillColor("#0f172a").text("J&K Cabinet List", 36, 105, { width: 540 });
  doc.font("Helvetica").fontSize(10).text(`Project: ${projectName}`, 36, doc.y + 8, { width: 540 });
  doc.text(`Generated: ${generated}`, 36, doc.y + 5, { width: 540 });
  drawJkCabinetTable(doc, rows, doc.y + 20);
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const margin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.font("Helvetica").fontSize(7).fillColor("#94a3b8")
      .text(`Page ${i + 1} of ${range.count}`, 36, 755, { width: 540, align: "center", lineBreak: false });
    doc.page.margins.bottom = margin;
  }
  doc.end();
  return result;
}

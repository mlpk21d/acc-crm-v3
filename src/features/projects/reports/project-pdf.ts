import PDFDocument from "pdfkit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Project } from "../data";
import { drawRoomsTable, type RoomReportRow } from "./rooms-table";

export type ProjectReportFinancials = {
  roomCosts: number; installCost: number; miscCost: number; drawingCost: number;
  total: number; profit: number; totalCost: number; margin: number;
};
const timezone = "America/New_York";
export function projectPdfFilename(name: string, date: Date): string {
  const safe = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "Project";
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  return `${safe}-Project-Report-${day}.pdf`;
}
const display = (value: string | null) => value?.trim() || "—";
const dateValue = (value: string | null) => value ? new Date(`${value}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "—";
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export async function createProjectPdf(project: Project, rooms: readonly RoomReportRow[], financials: ProjectReportFinancials | null, date = new Date()): Promise<Buffer> {
  const logo = await readFile(path.join(process.cwd(), "public/images/acc-logo.svg"), "utf8");
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 40, bottom: 55, left: 36, right: 36 }, bufferPages: true,
    info: { Title: `${project.name} | Project Report`, Author: "ACC CRM" } });
  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const generated = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: timezone });
  let y = 40;
  const bottom = 737;
  const ensure = (height: number) => { if (y + height > bottom) { doc.addPage(); y = 40; } };
  const heading = (title: string, x: number, top: number) => {
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#94a3b8").text(title, x, top, { width: 510 });
  };
  doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(`Generated: ${generated}`, 36, y, { width: 540, align: "right" });
  doc.font("Helvetica-Bold").fontSize(18).fillColor("#0f172a").text(project.name, 36, y + 19, { width: 540 });
  doc.font("Helvetica").fontSize(9).fillColor("#475569").text(project.status, 36, doc.y + 7, { width: 540 });
  y = doc.y + 16;
  doc.moveTo(36, y).lineTo(576, y).lineWidth(1).strokeColor("#0f172a").stroke();
  y += 14;

  const details = [
    ["Project Address", display(project.project_address)], ["Designer", display(project.project_designer)],
    ["Order By Date", dateValue(project.order_by_date)], ["Official Start Date", dateValue(project.official_start_date)],
    ["Install Date", dateValue(project.install_date)],
  ];
  const contact = [["Name", display(project.project_contact_name || project.contact_name)],
    ["Phone", display(project.project_contact_phone || project.contact_phone)], ["Company", display(project.contact_company)]];
  // Paired rows keep the detail/contact columns aligned, including wrapped values.
  const detailHeading = () => { heading("PROJECT DETAILS", 46, y + 10); heading("PROJECT CONTACT", 322, y + 10); y += 31; };
  ensure(85); detailHeading();
  details.forEach((row, index) => {
    const pair = [row, contact[index]];
    doc.font("Helvetica").fontSize(8);
    const height = Math.max(23, ...pair.filter(Boolean).map(item => doc.heightOfString(item[1], { width: 137 }) + 12));
    if (y + height > bottom) { doc.addPage(); y = 40; detailHeading(); }
    pair.forEach((item, col) => {
      if (!item) return;
      const x = 36 + col * 276;
      doc.rect(x, y, 264, height).lineWidth(0.4).strokeColor("#e2e8f0").stroke();
      doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(item[0], x + 10, y + 6, { width: 102 });
      doc.fillColor("#475569").text(item[1], x + 117, y + 6, { width: 137, align: "right" });
    });
    y += height;
  });
  y += 14;

  if (financials) {
    ensure(191);
    doc.roundedRect(36, y, 540, 177, 8).lineWidth(0.4).strokeColor("#dbe3ee").stroke();
    heading("FINANCIAL SUMMARY", 46, y + 12);
    const values: [string, number][] = [["Room Costs", financials.roomCosts], ["Install Cost", financials.installCost],
      ["Misc Cost", financials.miscCost], ["Drawing Cost", financials.drawingCost], ["Total", financials.total], ["Profit", financials.profit]];
    values.forEach(([label, value], index) => {
      const x = 46 + (index % 2) * 127;
      const top = y + 31 + Math.floor(index / 2) * 40;
      doc.roundedRect(x, top, 121, 35, 4).fill("#f8fafc");
      doc.font("Helvetica").fontSize(6.5).fillColor("#94a3b8").text(label.toUpperCase(), x + 7, top + 5, { width: 107 });
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a").text(money(value), x + 7, top + 17, { width: 107 });
    });
    doc.roundedRect(316, y + 31, 250, 115, 6).fill("#0f172a");
    doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text("TOTAL COST", 326, y + 66, { width: 230, align: "center" });
    doc.font("Helvetica-Bold").fontSize(21).fillColor("#ffffff").text(money(financials.totalCost), 326, y + 84, { width: 230, align: "center" });
    doc.font("Helvetica").fontSize(8).fillColor("#64748b").text(`Margin: ${Number(financials.margin.toFixed(2))}%`, 46, y + 158, { width: 254 });
    y += 191;
  }

  // Split long notes to the available page height, preserving all text/newlines.
  let remaining = display(project.notes);
  let continued = false;
  while (remaining.length) {
    ensure(65);
    const top = y;
    heading(continued ? "NOTES - CONTINUED" : "NOTES", 46, y + 12);
    y += 31;
    doc.font("Helvetica").fontSize(9);
    const options = { width: 520, lineGap: 3 };
    const available = bottom - y - 12;
    let end = remaining.length;
    if (doc.heightOfString(remaining, options) > available) {
      let low = 1, high = remaining.length;
      while (low < high) {
        const mid = Math.ceil((low + high) / 2);
        if (doc.heightOfString(remaining.slice(0, mid), options) <= available) low = mid; else high = mid - 1;
      }
      end = low;
      const space = remaining.slice(0, end).search(/\s+\S*$/);
      if (space > 0) end = space + 1;
    }
    doc.fillColor("#475569").text(remaining.slice(0, end), 46, y, { ...options, height: available });
    y = doc.y + 12;
    doc.roundedRect(36, top, 540, y - top, 8).lineWidth(0.4).strokeColor("#dbe3ee").stroke();
    remaining = remaining.slice(end);
    y += 14;
    if (remaining) { doc.addPage(); y = 40; continued = true; }
  }
  drawRoomsTable(doc, rooms, y);
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    // Draw the supplied vector logo at low opacity on every buffered page.
    // Overlaying it keeps it visible through filled table cells without affecting layout.
    const scale = 440 / 266.85;
    doc.save().translate((doc.page.width - 440) / 2, (doc.page.height - 77.28 * scale) / 2)
      .scale(scale).fillOpacity(0.045).fillColor("#111827");
    for (const shape of logo.matchAll(/<(path|polygon)\b[^>]*>/g)) {
      if (shape[1] === "path") {
        const d = shape[0].match(/\bd="([^"]+)"/)?.[1];
        if (d) doc.path(d).fill();
      } else {
        const points = shape[0].match(/\bpoints="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number) ?? [];
        if (points.length >= 6) {
          doc.moveTo(points[0], points[1]);
          for (let j = 2; j < points.length; j += 2) doc.lineTo(points[j], points[j + 1]);
          doc.closePath().fill();
        }
      }
    }
    doc.restore();
    doc.page.margins.bottom = 0;
    doc.font("Helvetica").fontSize(7).fillColor("#94a3b8")
      .text(`Generated by ACC CRM - ${generated} | Page ${i + 1} of ${range.count}`, 36, 755, { width: 540, align: "center", lineBreak: false });
    doc.page.margins.bottom = 55;
  }
  doc.end();
  return result;
}

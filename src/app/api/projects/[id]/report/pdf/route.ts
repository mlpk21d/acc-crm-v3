import { getProjectFinancials, summarizeProjectFinancials } from "@/features/projects/financial-data";
import { getCurrentCrmUser } from "@/features/auth/session";
import { can } from "@/features/auth/permissions";
import { getProject } from "@/features/projects/data";
import { listProjectRooms } from "@/features/projects/rooms-data";
import { createProjectPdf, projectPdfFilename } from "@/features/projects/reports/project-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const privateHeaders = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentCrmUser();
  if (!user) return new Response("Please sign in to download this report.", { status: 401, headers: privateHeaders });
  if (!can(user.role, "projects:read")) return new Response("Forbidden", { status: 403, headers: privateHeaders });
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return new Response("Project not found", { status: 404, headers: privateHeaders });
  }
  const project = await getProject(id);
  if (!project) return new Response("Project not found", { status: 404, headers: privateHeaders });
  const rooms = await listProjectRooms(id);
  const date = new Date();
  const financials = user.role === "admin" ? await getProjectFinancials(id) : null;
  const summary = financials ? {
    ...summarizeProjectFinancials(financials.project, financials.rooms),
    installCost: Number(financials.project.install_cost),
    miscCost: Number(financials.project.misc_cost),
    drawingCost: Number(financials.project.drawing_cost),
  } : null;
  const pdf = await createProjectPdf(project, rooms, summary, date);
  return new Response(new Uint8Array(pdf), { headers: {
    ...privateHeaders,
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${projectPdfFilename(project.name, date)}"`,
    "X-Content-Type-Options": "nosniff",
  } });
}

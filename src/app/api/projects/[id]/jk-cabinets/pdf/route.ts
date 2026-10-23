import { getCurrentCrmUser } from "@/features/auth/session";
import { can } from "@/features/auth/permissions";
import { getProject } from "@/features/projects/data";
import { listProjectJkCabinets } from "@/features/projects/reports/jk-cabinet-data";
import { createJkCabinetPdf, jkCabinetFilename } from "@/features/projects/reports/jk-cabinet-pdf";

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
  const rows = await listProjectJkCabinets(id);
  if (!rows.length) return new Response("No enabled J&K rooms contain cabinets.", { status: 404, headers: privateHeaders });
  const date = new Date();
  const pdf = await createJkCabinetPdf(project.name, rows, date);
  return new Response(new Uint8Array(pdf), { headers: {
    ...privateHeaders,
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${jkCabinetFilename(project.name)}"`,
    "X-Content-Type-Options": "nosniff",
  } });
}

import "server-only";
import { getDbPool } from "@/lib/db";
import type { JkReportRow } from "./jk-cabinet-table";

// Nonfinancial report data, safe for authorized projects:read callers.
export async function listProjectJkCabinets(projectId: string): Promise<JkReportRow[]> {
  const { rows } = await getDbPool().query<JkReportRow>(`
    SELECT r.id AS room_id, r.room_name, i.item, i.description,
      i.hinge_direction, i.quantity, i.custom,
      p.series AS catalog_series, p.item_code AS catalog_item_code
    FROM public.project_rooms r
    JOIN public.jk_room_cabinet_items i ON i.room_id = r.id
    LEFT JOIN public.jk_price_items p ON p.id = i.price_item_id
    WHERE r.project_id = $1 AND r.enabled = true AND r.manufacturer = 'J&K'
    ORDER BY r.sort_order, r.id, i.sort_order, i.id`, [projectId]);
  return rows;
}

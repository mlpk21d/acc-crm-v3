import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { DropdownSettings, type Option } from "@/features/settings/dropdown-settings";

export default async function SettingsPage() {
  await requirePermission("settings:manage");
  const { rows } = await getDbPool().query<Option>(
    "SELECT id,category,value,label,color,active,sort_order FROM public.crm_settings_options WHERE category = ANY($1::text[]) ORDER BY category,sort_order,label,id",
    [["type","region","status","project_status","manufacturer"]],
  );
  return <section>
    <div className="page-heading"><div><h1>Settings</h1><p>Manage application configuration and tools</p></div></div>
    <div className="crm-settings-primary-tabs"><span className="active">Dropdown Options</span></div>
    <DropdownSettings options={rows}/>
  </section>;
}

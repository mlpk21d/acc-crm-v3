import Link from "next/link";
import {ButtonIcon} from "@/components/button-icon";
import {JkPriceImporter} from "@/features/settings/jk-price-importer";
import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { DropdownSettings, type Option } from "@/features/settings/dropdown-settings";

export default async function SettingsPage({searchParams}:{searchParams:Promise<{tab?:string}>}) {
  await requirePermission("settings:manage");
  const importing=(await searchParams).tab==="import";
  const { rows } = importing?{rows:[]}:await getDbPool().query<Option>(
    "SELECT id,category,value,label,color,active,sort_order FROM public.crm_settings_options WHERE category = ANY($1::text[]) ORDER BY category,sort_order,label,id",
    [["type","region","status","project_status","manufacturer"]],
  );
  return <section>
    <div className="page-heading"><div><h1>Settings</h1><p>Manage application configuration and tools</p></div></div>
    <nav className="crm-settings-primary-tabs" aria-label="Settings sections"><Link href="/settings" className={!importing?"active":""} aria-current={!importing?"page":undefined}><ButtonIcon kind="filter"/>Dropdown Options</Link><Link href="/settings?tab=import" className={importing?"active":""} aria-current={importing?"page":undefined}><ButtonIcon kind="upload"/>Import</Link></nav>
    {importing?<JkPriceImporter/>:<DropdownSettings options={rows}/>}
  </section>;
}

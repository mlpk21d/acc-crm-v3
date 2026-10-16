import { requirePermission } from "@/features/auth/session";
import { getDbPool } from "@/lib/db";
import { saveRegionOption, toggleRegionOption } from "@/features/contacts/region-settings-actions";

export default async function SettingsPage() {
  await requirePermission("settings:manage");
  const { rows } = await getDbPool().query<{value:string;label:string;active:boolean}>(
    "SELECT value,label,active FROM public.crm_settings_options WHERE category='region' ORDER BY sort_order,label"
  );
  return <section>
    <div className="page-heading"><div><h1>Settings</h1><p>Manage application and business settings.</p></div></div>
    <div className="content-card crm-settings-card">
      <h2>Regions</h2><p>Regions available in Contacts forms.</p>
      <form action={saveRegionOption} className="crm-region-create">
        <label>Value<input name="value" required maxLength={100} /></label>
        <label>Label<input name="label" required maxLength={100} /></label>
        <button type="submit">Add Region</button>
      </form>
      <div className="crm-region-list">
        {rows.map(option => <div key={option.value} className="crm-region-row">
          <span><strong>{option.label}</strong><small>{option.value}</small></span>
          <form action={toggleRegionOption}><input type="hidden" name="value" value={option.value} /><input type="hidden" name="active" value={String(!option.active)} /><button type="submit">{option.active ? "Deactivate" : "Activate"}</button></form>
        </div>)}
        {rows.length === 0 && <p>No regions configured. Add regions to populate the Contacts dropdown.</p>}
      </div>
    </div>
  </section>;
}

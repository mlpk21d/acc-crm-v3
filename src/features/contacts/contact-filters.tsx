"use client";
import { ButtonIcon } from "@/components/button-icon";

import Link from "next/link";
import { useEffect, useState } from "react";

type Filters = { search:string; region:string; type:string; status:string; contacted:string };
type Options = { regions:string[]; types:string[]; statuses:string[] };
export function ContactFilters({filters, options}: {filters:Filters;options:Options}) {
  const [open,setOpen] = useState(false);
  const count = [filters.search,filters.region,filters.type,filters.status,filters.contacted].filter(Boolean).length;
  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);
  return <>
    <button type="button" className="crm-filters-button" onClick={() => setOpen(true)}>Filters{count > 0 ? <span className="crm-filter-count">{count}</span> : null}<ButtonIcon kind="filter" /></button>
    {open && <div className="crm-filter-overlay">
      <button className="crm-filter-backdrop" type="button" aria-label="Close filters" onClick={() => setOpen(false)} />
      <aside role="dialog" aria-modal="true" aria-labelledby="contact-filter-heading" className="crm-filter-drawer">
        <div className="crm-filter-heading"><h2 id="contact-filter-heading">Filters</h2><button type="button" aria-label="Close filters" onClick={() => setOpen(false)}>✕<ButtonIcon kind="close" /></button></div>
        <form method="get" action="/contacts" className="crm-filter-body">
          <label>Search<input name="q" maxLength={100} defaultValue={filters.search} placeholder="Company or contact" /></label>
          <label>Region<select name="region" defaultValue={filters.region}><option value="">All regions</option>{options.regions.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
          <label>Type<select name="type" defaultValue={filters.type}><option value="">All types</option>{options.types.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
          <label>Status<select name="status" defaultValue={filters.status}><option value="">All statuses</option>{options.statuses.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
          <label>Contacted<select name="contacted" defaultValue={filters.contacted}><option value="">All</option><option value="yes">Yes</option><option value="no">No</option></select></label>
          <div className="crm-filter-footer"><Link href="/contacts" onClick={() => setOpen(false)}>Clear all</Link><button type="submit">Apply Filters<ButtonIcon kind="filter" /></button></div>
        </form>
      </aside>
    </div>}
  </>;
}

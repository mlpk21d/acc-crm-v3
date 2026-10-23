"use client";
import { useState } from "react";

type Props = { created: string; updated: string; editable?: boolean };
const dateInput = (value: string) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date(value));
const dateDisplay = (value: string) => new Date(value).toLocaleDateString("en-US", {
  timeZone: "America/New_York", year: "numeric", month: "short", day: "numeric",
});
export function ProjectRecordInfo({ created, updated, editable = false }: Props) {
  const [values, setValues] = useState({ created: dateInput(created), updated: dateInput(updated) });
  const initial = { created: dateInput(created), updated: dateInput(updated) };
  return <div className="crm-project-record-row"><section className="content-card crm-project-record-info">
    <h2>Record Info</h2><div className="crm-project-record-fields">
      {(["created", "updated"] as const).map(key => <div key={key}>
        {editable ? <label>{key === "created" ? "Created" : "Updated"}
          <input type="date" required form="crm-project-core-form"
            name={values[key] !== initial[key] ? `record_${key}` : undefined}
            value={values[key]} onChange={event => setValues(old => ({ ...old, [key]: event.target.value }))}/>
        </label> : <><span className="crm-project-detail-label">{key === "created" ? "Created" : "Updated"}</span>
          <p><time dateTime={key === "created" ? created : updated}>{dateDisplay(key === "created" ? created : updated)}</time></p></>}
      </div>)}
    </div>
  </section></div>;
}

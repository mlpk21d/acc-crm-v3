import type {CSSProperties} from "react";
import type {CabinetrySpecs} from "./cabinetry-sections";

export function manufacturerRowStyle(color: string | null | undefined): CSSProperties {
 return /^#[0-9a-f]{6}$/i.test(color ?? "")
  ? ({"--room-row-color":color} as CSSProperties)
  : {};
}

export function RoomSpecCells({specs}: {specs:{[Field in keyof CabinetrySpecs]: string | null}}) {
 return <>
  <td>{specs.door_style || "—"}</td>
  <td>{specs.drawer_style || "—"}</td>
  <td>{specs.species || "—"}</td>
  <td>{specs.finish || "—"}</td>
  <td>{specs.construction || "—"}</td>
  <td>{specs.manufacturer || "—"}</td>
 </>;
}

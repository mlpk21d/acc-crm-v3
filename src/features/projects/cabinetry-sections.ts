import {z} from "zod";

export const cabinetryFields = [
 ["door_style", "Door Style"],
 ["species", "Species"],
 ["drawer_style", "Drawer Style"],
 ["finish", "Finish"],
 ["construction", "Construction"],
 ["manufacturer", "Manufacturer"],
] as const;

export const cabinetryConstructions = ["Inset", "Inset Beaded", "Full Overlay", "Frameless"];
export const maxCabinetrySections = 12;

export const cabinetrySectionSchema = z.object({
 id: z.uuid(),
 name: z.string().trim().min(1).max(80),
 door_style: z.string().trim().max(200),
 drawer_style: z.string().trim().max(200),
 species: z.string().trim().max(200),
 finish: z.string().trim().max(200),
 construction: z.string().trim().max(200),
 manufacturer: z.string().trim().max(100),
});

export const cabinetrySectionsSchema = z.array(cabinetrySectionSchema).max(maxCabinetrySections)
 .refine(sections=>new Set(sections.map(section=>section.id)).size===sections.length);
export type CabinetrySection = z.infer<typeof cabinetrySectionSchema>;
export type CabinetrySpecs = Omit<CabinetrySection, "id" | "name">;

export const primaryCabinetryLabel = "Primary Cabinetry";

export function validCabinetrySectionNames(sections: CabinetrySection[]) {
 const names = sections.map(section => section.name.trim().toLowerCase());
 return names.every(Boolean) && new Set(names).size === names.length;
}

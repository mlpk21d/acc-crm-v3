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
 name: z.string().trim().min(1).max(80),
 door_style: z.string().trim().max(200),
 drawer_style: z.string().trim().max(200),
 species: z.string().trim().max(200),
 finish: z.string().trim().max(200),
 construction: z.string().trim().max(200),
 manufacturer: z.string().trim().max(100),
});

export const cabinetrySectionsSchema = z.array(cabinetrySectionSchema).max(maxCabinetrySections);
export type CabinetrySection = z.infer<typeof cabinetrySectionSchema>;
export type CabinetrySpecs = Omit<CabinetrySection, "name">;

export function primaryCabinetryLabel(roomName: string) {
 return /\bkitchen\b/i.test(roomName) ? "Perimeter" : "Primary Cabinetry";
}

export function validCabinetrySectionNames(roomName: string, sections: CabinetrySection[]) {
 const names = sections.map(section => section.name.trim().toLowerCase());
 const primary = primaryCabinetryLabel(roomName).toLowerCase();
 return names.every(name => name && name !== primary) && new Set(names).size === names.length;
}

import { z } from "zod";

export const contactFields = [
  "contact_type", "first_name", "last_name", "company_name", "email",
  "phone", "mobile_phone", "address_line_1", "address_line_2", "city",
  "state_region", "postal_code", "country_code", "notes",
] as const;

export const contactSchema = z.object({
  contact_type: z.enum(["person", "business"]),
  first_name: z.string().trim().max(150),
  last_name: z.string().trim().max(150),
  company_name: z.string().trim().max(200),
  email: z.union([z.email(), z.literal("")]),
  phone: z.string().trim().max(50),
  mobile_phone: z.string().trim().max(50),
  address_line_1: z.string().trim().max(200),
  address_line_2: z.string().trim().max(200),
  city: z.string().trim().max(100),
  state_region: z.string().trim().max(100),
  postal_code: z.string().trim().max(30),
  country_code: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  notes: z.string().trim().max(10000),
}).refine((value) => Boolean(value.first_name || value.last_name || value.company_name), {
  message: "A first name, last name, or company is required.",
  path: ["first_name"],
});

export function parseContactForm(formData: FormData) {
  const values = Object.fromEntries(
    contactFields.map((field) => [field, formData.get(field)]),
  );
  return contactSchema.safeParse(values);
}

export function parseContactId(value: FormDataEntryValue | null) {
  return typeof value === "string" ? z.uuid().safeParse(value) : { success: false as const };
}

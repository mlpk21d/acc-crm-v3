import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contact_id: z.union([z.uuid(), z.literal("")]),
  status: z.string().trim().min(1).max(100),
  description: z.string().trim().max(10000),
  project_address:z.string().trim().max(500),project_contact_name:z.string().trim().max(200),project_contact_phone:z.string().trim().max(50),
  project_designer:z.string().trim().max(200),next_step:z.string().trim().max(200),sample_signoff_status:z.string().trim().max(200),
  order_by_date:z.union([z.iso.date(),z.literal("")]),official_start_date:z.union([z.iso.date(),z.literal("")]),install_date:z.union([z.iso.date(),z.literal("")]),
  notes:z.string().trim().max(20000),
});
export type ProjectInput = z.infer<typeof projectSchema>;
export function parseProjectForm(form: FormData) {
  return projectSchema.safeParse({
    name: form.get("name"), contact_id: form.get("contact_id"),
    status: form.get("status"), description: form.get("description"),
    ...Object.fromEntries(["project_address","project_contact_name","project_contact_phone","project_designer","next_step","sample_signoff_status","order_by_date","official_start_date","install_date","notes"].map(k=>[k,form.get(k)??""])),
  });
}

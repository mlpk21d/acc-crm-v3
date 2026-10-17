import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contact_id: z.union([z.uuid(), z.literal("")]),
  status: z.string().trim().min(1).max(100),
  description: z.string().trim().max(10000),
});
export type ProjectInput = z.infer<typeof projectSchema>;
export function parseProjectForm(form: FormData) {
  return projectSchema.safeParse({
    name: form.get("name"), contact_id: form.get("contact_id"),
    status: form.get("status"), description: form.get("description"),
  });
}

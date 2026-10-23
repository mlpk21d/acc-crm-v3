import { z } from "zod";

/** Omitted fields retain Created and automatically advance Updated. */
export function parseProjectRecordDates(form: FormData) {
  return z.object({ created: z.iso.date().optional(), updated: z.iso.date().optional() }).safeParse({
    created: form.has("record_created") ? form.get("record_created") : undefined,
    updated: form.has("record_updated") ? form.get("record_updated") : undefined,
  });
}

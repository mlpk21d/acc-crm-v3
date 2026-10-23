import assert from "node:assert/strict";
import test from "node:test";
import { parseProjectRecordDates } from "../src/features/projects/record-info-validation.ts";

test("unchanged record dates do not become timestamp overrides", () => {
  assert.deepEqual(parseProjectRecordDates(new FormData()).data, {created:undefined,updated:undefined});
});
test("accepts historical imports and rejects invalid calendar dates", () => {
  const form = new FormData();
  form.set("record_created", "2020-02-29");
  form.set("record_updated", "2021-12-31");
  assert.deepEqual(parseProjectRecordDates(form).data, {created:"2020-02-29",updated:"2021-12-31"});
  for (const invalid of ["2025-02-29", "2026-13-01", "", "yesterday", "2026-10-23T00:00:00Z"]) {
    form.set("record_updated", invalid);
    assert.equal(parseProjectRecordDates(form).success, false);
  }
});

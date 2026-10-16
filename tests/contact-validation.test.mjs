import assert from "node:assert/strict";
import test from "node:test";
import { parseContactForm, parseContactId } from "../src/features/contacts/validation.ts";

function form(values = {}) {
  const data = new FormData();
  const defaults = {
    contact_type: "person", first_name: "Jane", last_name: "Doe",
    company_name: "", email: "", phone: "", mobile_phone: "",
    address_line_1: "", address_line_2: "", city: "", state_region: "",
    postal_code: "", country_code: "US", notes: "",
  };
  for (const [key, value] of Object.entries({ ...defaults, ...values })) data.set(key, value);
  return data;
}

test("valid contact is parsed and whitespace normalized", () => {
  const parsed = parseContactForm(form({ first_name: " Jane ", country_code: "us" }));
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.first_name, "Jane");
  assert.equal(parsed.data.country_code, "US");
});

test("rejects invalid email, missing names, oversized fields, and invalid types", () => {
  for (const values of [
    { email: "not-an-email" },
    { first_name: "", last_name: "", company_name: "" },
    { notes: "x".repeat(10001) },
    { contact_type: "other" },
  ]) assert.equal(parseContactForm(form(values)).success, false);
});

test("rejects missing fields instead of silently converting to empty strings", () => {
  const data = form();
  data.delete("country_code");
  assert.equal(parseContactForm(data).success, false);
});

test("rejects malformed contact identifiers", () => {
  assert.equal(parseContactId("not-uuid").success, false);
  assert.equal(parseContactId(null).success, false);
  assert.equal(parseContactId("8b56cce3-ae04-4de0-8288-980ace865eb1").success, true);
});

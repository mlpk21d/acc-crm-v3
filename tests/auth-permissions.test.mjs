import assert from "node:assert/strict";
import test from "node:test";

import { can } from "../src/features/auth/permissions.ts";

test("administrators receive all configured permissions", () => {
  for (const permission of [
    "contacts:read", "contacts:write", "projects:read", "projects:write",
    "invoices:read", "invoices:write", "settings:manage", "users:manage",
  ]) assert.equal(can("admin", permission), true);
});

test("staff cannot write records or access administrative settings", () => {
  for (const permission of [
    "contacts:write", "projects:write", "invoices:write",
    "settings:manage", "users:manage",
  ]) assert.equal(can("staff", permission), false);
});

test("managers cannot manage accounts or settings", () => {
  assert.equal(can("manager", "settings:manage"), false);
  assert.equal(can("manager", "users:manage"), false);
  assert.equal(can("manager", "contacts:write"), true);
});

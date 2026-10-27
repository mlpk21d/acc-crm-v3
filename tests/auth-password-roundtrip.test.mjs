import assert from "node:assert/strict";
import test from "node:test";

import { hashPassword, verifyPassword } from "better-auth/crypto";

test("Better Auth password reset hash verifies correctly", async () => {
  const newPassword = "Test-password-9#unique";
  const hash = await hashPassword(newPassword);

  assert.notEqual(hash, newPassword);
  assert.equal(await verifyPassword({ hash, password: newPassword }), true);
  assert.equal(await verifyPassword({ hash, password: "Old-password-8#bad" }), false);
});

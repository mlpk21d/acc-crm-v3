import assert from "node:assert/strict";
import test from "node:test";

import { shouldDisableCsrfCheck } from "../src/lib/auth-security.ts";

function policy(nodeEnv, appUrl, authUrl = appUrl) {
  return shouldDisableCsrfCheck({ nodeEnv, appUrl, authUrl });
}

test("allows the CSRF exception for matching localhost development URLs", () => {
  assert.equal(policy("development", "http://localhost:3000"), true);
  assert.equal(policy("development", "http://127.0.0.1:3000"), true);
  assert.equal(policy("development", "http://[::1]:3000"), true);
});

test("never disables CSRF for production or test processes", () => {
  assert.equal(policy("production", "http://localhost:3000"), false);
  assert.equal(policy("test", "http://localhost:3000"), false);
  assert.equal(policy(undefined, "http://localhost:3000"), false);
});

test("never disables CSRF for public, mismatched, or malformed origins", () => {
  assert.equal(policy("development", "https://crm.example.com"), false);
  assert.equal(policy("development", "http://192.168.1.23:3000"), false);
  assert.equal(policy("development", "http://localhost:3000", "https://crm.example.com"), false);
  assert.equal(policy("development", "http://localhost:3000", "http://localhost:3001"), false);
  assert.equal(policy("development", "http://localhost:3000", "http://127.0.0.1:3000"), false);
  assert.equal(policy("development", "not-a-url"), false);
});

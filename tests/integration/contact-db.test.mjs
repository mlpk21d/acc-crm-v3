import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import { Client } from "pg";

test("contacts database supports create, update, and soft-delete inside a rolled-back transaction", async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for database integration tests.");

  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  await client.connect();

  try {
    await client.query("BEGIN");
    const id = randomUUID();
    const inserted = await client.query(
      `INSERT INTO public.contacts (id, first_name, last_name, email, contact_type)
       VALUES ($1, $2, $3, $4, 'person') RETURNING id, email, deleted_at`,
      [id, "Integration", "Test", "integration-test@example.invalid"],
    );
    assert.equal(inserted.rows[0].id, id);

    const updated = await client.query(
      "UPDATE public.contacts SET first_name=$2, updated_at=now() WHERE id=$1 RETURNING first_name",
      [id, "Updated"],
    );
    assert.equal(updated.rows[0].first_name, "Updated");

    const deleted = await client.query(
      "UPDATE public.contacts SET deleted_at=now() WHERE id=$1 RETURNING deleted_at",
      [id],
    );
    assert.ok(deleted.rows[0].deleted_at);
    const active = await client.query(
      "SELECT id FROM public.contacts WHERE id=$1 AND deleted_at IS NULL",
      [id],
    );
    assert.equal(active.rowCount, 0);
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    await client.end();
  }
});

test("contacts enforce the required name constraint", async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for database integration tests.");
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  await client.connect();
  try {
    await client.query("BEGIN");
    await assert.rejects(
      client.query("INSERT INTO public.contacts (first_name, last_name, company_name) VALUES ('', '', '')"),
      (error) => error.code === "23514",
    );
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    await client.end();
  }
});

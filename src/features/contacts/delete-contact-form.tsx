"use client";

import type { FormEvent } from "react";

import { deleteContact } from "@/features/contacts/actions";

export function DeleteContactForm({ id }: { id: string }) {
  function confirmDeletion(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Delete this contact? This action will remove it from active contact lists.")) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteContact} onSubmit={confirmDeletion}>
      <input type="hidden" name="id" value={id} />
      <button type="submit">Delete contact</button>
    </form>
  );
}

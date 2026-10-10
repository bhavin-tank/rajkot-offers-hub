"use client";

import type { AdminState } from "@/lib/admin/state";
import { ActionForm, FormField, SubmitButton } from "./action-form";
import { inputClass } from "./ui";

export function AddAdminForm({ action }: { action: (state: AdminState, data: FormData) => Promise<AdminState> }) {
  return (
    <ActionForm action={action} resetOnSuccess>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
        <FormField label="Mobile" name="mobile">
          <input id="mobile" name="mobile" type="tel" inputMode="numeric" placeholder="98XXX XXXXX" className={inputClass} />
        </FormField>
        <FormField label="Name (optional)" name="name">
          <input id="name" name="name" className={inputClass} />
        </FormField>
        <FormField label="Role" name="role">
          <select id="role" name="role" defaultValue="admin" className={inputClass}>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </FormField>
        <SubmitButton>Add</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function UserControls({
  action,
  role,
  status,
  canChangeRole,
}: {
  action: (state: AdminState, data: FormData) => Promise<AdminState>;
  role: string;
  status: string;
  canChangeRole: boolean;
}) {
  return (
    <ActionForm action={action} className="gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <select name="role" defaultValue={role} disabled={!canChangeRole} aria-label="Role" className={`${inputClass} h-9 w-36`}>
          {["user", "business", "admin", "superadmin"].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} aria-label="Status" className={`${inputClass} h-9 w-28`}>
          <option value="active">active</option>
          <option value="blocked">blocked</option>
        </select>
        <SubmitButton variant="outline" className="h-9">
          Save
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

"use client";

import type { AdminState } from "@/lib/admin/state";
import { ActionForm, SubmitButton } from "./action-form";
import { inputClass } from "./ui";

/** Status select + internal note, for inbox items (reports, messages). */
export function NoteForm({
  action,
  statuses,
  status,
  note,
}: {
  action: (state: AdminState, data: FormData) => Promise<AdminState>;
  statuses: { value: string; label: string }[];
  status: string;
  note?: string;
}) {
  return (
    <ActionForm action={action} className="gap-1.5">
      <div className="flex flex-wrap gap-2">
        <select name="status" defaultValue={statuses.some((s) => s.value === status) ? status : statuses[0].value} aria-label="Status" className={`${inputClass} h-9 w-36`}>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input name="note" defaultValue={note} placeholder="Internal note" aria-label="Note" className={`${inputClass} h-9 min-w-40 flex-1`} />
        <SubmitButton variant="outline" className="h-9">
          Save
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

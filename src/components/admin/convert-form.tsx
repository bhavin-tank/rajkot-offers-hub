"use client";

import type { AdminState } from "@/lib/admin/state";
import { ActionForm, FormField, SubmitButton } from "./action-form";
import { inputClass } from "./ui";

/** Choose the business (new or existing) and the card badge, then create the offer. */
export function ConvertForm({
  action,
  matches,
  businesses,
  suggestedBadge,
}: {
  action: (state: AdminState, data: FormData) => Promise<AdminState>;
  matches: { id: string; name: string }[];
  businesses: { id: string; name: string; areaSlug: string }[];
  suggestedBadge: string;
}) {
  return (
    <ActionForm action={action}>
      <FormField label="Business" name="business" hint={matches.length ? "Possible matches are listed first." : undefined}>
        <select id="business" name="business" defaultValue={matches[0]?.id ?? "new"} className={inputClass}>
          <option value="new">Create a new business from this submission</option>
          {matches.length > 0 && (
            <optgroup label="Possible matches">
              {matches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="All businesses">
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {b.areaSlug}
              </option>
            ))}
          </optgroup>
        </select>
      </FormField>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <FormField label="Card badge" name="badge" hint="“20% OFF”, “1 + 1”">
          <input id="badge" name="badge" defaultValue={suggestedBadge} maxLength={24} className={inputClass} />
        </FormField>
        <FormField label="Discount %" name="discount">
          <input id="discount" name="discount" type="number" min={0} max={100} defaultValue={0} className={`${inputClass} w-28`} />
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="publish" className="size-4 accent-primary" />
        Publish straight away (otherwise it waits in the review queue)
      </label>
      <div>
        <SubmitButton>Create offer</SubmitButton>
      </div>
    </ActionForm>
  );
}

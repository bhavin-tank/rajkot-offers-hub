"use client";

import type { AdminState } from "@/lib/admin/state";
import { ActionForm, SubmitButton, useFieldError } from "./action-form";
import { inputClass } from "./ui";

/** One compact row: slug, English and Gujarati names, order, visibility. */
export function AreaForm({
  action,
  values,
  isNew,
}: {
  action: (state: AdminState, data: FormData) => Promise<AdminState>;
  values: { slug: string; name: { en: string; gu?: string }; sortOrder: number; isActive: boolean };
  isNew?: boolean;
}) {
  return (
    <ActionForm action={action} resetOnSuccess={isNew} className="gap-2">
      <AreaFields values={values} isNew={isNew} />
    </ActionForm>
  );
}

function AreaFields({ values, isNew }: { values: { slug: string; name: { en: string; gu?: string }; sortOrder: number; isActive: boolean }; isNew?: boolean }) {
  const slugError = useFieldError("slug");
  const nameError = useFieldError("name");
  const error = slugError ?? nameError;
  return (
    <>
      <div className="grid items-center gap-2 sm:grid-cols-[1fr_1fr_1fr_80px_auto_auto]">
        <input name="slug" defaultValue={values.slug} readOnly={!isNew} placeholder="slug, e.g. kalawad-road" aria-label="Slug" className={inputClass} />
        <input name="name.en" defaultValue={values.name.en} placeholder="English name" aria-label="English name" className={inputClass} />
        <input name="name.gu" defaultValue={values.name.gu} placeholder="ગુજરાતી" aria-label="Gujarati name" lang="gu" className={inputClass} />
        <input name="sortOrder" type="number" min={0} defaultValue={values.sortOrder} aria-label="Order" className={inputClass} />
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={values.isActive} /> Visible
        </label>
        <SubmitButton variant={isNew ? "primary" : "outline"}>{isNew ? "Add area" : "Save"}</SubmitButton>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </>
  );
}

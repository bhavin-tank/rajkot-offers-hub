"use client";

import { useFieldError } from "./action-form";
import { inputClass, textareaClass } from "./ui";
import { cn } from "@/lib/utils";

/** English + Gujarati inputs for one text (`<name>.en`, `<name>.gu`). */
export function I18nField({
  name,
  label,
  defaultValue,
  multiline,
  required = true,
  hint,
  maxLength,
}: {
  name: string;
  label: string;
  defaultValue?: { en?: string; gu?: string };
  multiline?: boolean;
  required?: boolean;
  hint?: string;
  maxLength?: number;
}) {
  const error = useFieldError(name);
  const Control = multiline ? "textarea" : "input";
  const cls = multiline ? textareaClass : inputClass;
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">
        {label}
        {!required && <span className="font-normal text-muted"> (optional)</span>}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        <Control name={`${name}.en`} defaultValue={defaultValue?.en} maxLength={maxLength} aria-label={`${label} (English)`} aria-invalid={error ? true : undefined} placeholder="English" className={cn(cls)} />
        <Control name={`${name}.gu`} defaultValue={defaultValue?.gu} maxLength={maxLength} aria-label={`${label} (Gujarati)`} placeholder="ગુજરાતી (optional)" lang="gu" className={cls} />
      </div>
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </fieldset>
  );
}

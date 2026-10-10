"use client";

import type { ReactNode } from "react";
import type { AdminState } from "@/lib/admin/state";
import { ActionForm, SubmitButton } from "./action-form";

/** One button that runs an admin action with fixed fields (e.g. intent=approve). */
export function InlineAction({
  action,
  fields = {},
  children,
  variant = "outline",
  confirm,
}: {
  action: (state: AdminState, data: FormData) => Promise<AdminState>;
  fields?: Record<string, string>;
  children: ReactNode;
  variant?: "primary" | "outline" | "danger" | "dark";
  confirm?: string;
}) {
  return (
    <ActionForm action={action} className="gap-1">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton variant={variant} onClick={confirm ? (e) => !window.confirm(confirm) && e.preventDefault() : undefined}>
        {children}
      </SubmitButton>
    </ActionForm>
  );
}

/** A button plus a required text (reason / note) for actions like reject. */
export function ReasonAction({
  action,
  fields = {},
  label,
  placeholder,
  children,
  variant = "danger",
  extra,
}: {
  action: (state: AdminState, data: FormData) => Promise<AdminState>;
  fields?: Record<string, string>;
  label: string;
  placeholder: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "danger" | "dark";
  extra?: ReactNode;
}) {
  return (
    <ActionForm action={action} className="gap-2">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <label className="text-sm font-medium" htmlFor={`reason-${label}`}>
        {label}
      </label>
      <textarea id={`reason-${label}`} name="reason" required maxLength={500} placeholder={placeholder} className="min-h-16 rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary" />
      {extra}
      <div>
        <SubmitButton variant={variant}>{children}</SubmitButton>
      </div>
    </ActionForm>
  );
}

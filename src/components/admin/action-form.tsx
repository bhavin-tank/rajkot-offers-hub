"use client";

import { createContext, useActionState, useContext, useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { idle, type AdminState } from "@/lib/admin/state";
import { cn } from "@/lib/utils";

const StateContext = createContext<AdminState>(idle);

/** The error for one field from the last submit (keys like "title.en", "images", "hours.2"). */
export function useFieldError(name: string) {
  const state = useContext(StateContext);
  if (state.status !== "error" || !state.fields) return undefined;
  return state.fields[name] ?? Object.entries(state.fields).find(([key]) => key.startsWith(`${name}.`))?.[1];
}

/** A form bound to an admin server action: shows the result and field errors, keeps inputs on error. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
  onState,
}: {
  action: (state: AdminState, data: FormData) => Promise<AdminState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onState?: (state: AdminState) => void;
}) {
  const [state, formAction] = useActionState(action, idle);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success" && resetOnSuccess) form.current?.reset();
    onState?.(state);
  }, [state, resetOnSuccess, onState]);

  return (
    <StateContext value={state}>
      <form ref={form} action={formAction} className={cn("flex flex-col gap-4", className)} noValidate>
        {children}
        <FormMessage />
      </form>
    </StateContext>
  );
}

export function FormMessage() {
  const state = useContext(StateContext);
  if (state.status === "idle" || !("message" in state) || !state.message) return null;
  return (
    <p role={state.status === "error" ? "alert" : "status"} className={cn("text-sm", state.status === "error" ? "text-danger" : "text-open")}>
      {state.message}
    </p>
  );
}

const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  outline: "border border-line-strong bg-white text-ink hover:bg-surface",
  danger: "border border-red-200 bg-white text-danger hover:bg-red-50",
  dark: "bg-ink text-white hover:bg-ink/90",
} as const;

export function SubmitButton({ children, variant = "primary", className, ...props }: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      className={cn("inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap disabled:cursor-wait disabled:opacity-60", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

/** Label, control and error for one field. */
export function FormField({ label, name, hint, children, className }: { label: string; name: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  const error = useFieldError(name);
  return (
    <div className={cn("flex flex-col gap-1.5", className)} data-invalid={error ? true : undefined}>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

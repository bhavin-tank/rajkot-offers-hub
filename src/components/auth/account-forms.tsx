"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changeMpinAction, updateNameAction, type AuthResult } from "@/lib/actions/auth";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/translate";
import { PinInput } from "./pin-input";

function useSubmit() {
  const t = useT();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  function run(action: () => Promise<AuthResult>, success: MessageKey, onOk?: () => void) {
    setMessage(null);
    start(async () => {
      const result = await action();
      setMessage(result.ok ? { ok: true, text: t(success) } : { ok: false, text: t(result.error, result.vars) });
      if (result.ok) onOk?.();
    });
  }
  const shown = message && (
    <p role={message.ok ? "status" : "alert"} className={message.ok ? "text-sm text-open" : "text-sm text-danger"}>
      {message.text}
    </p>
  );
  return { run, pending, shown };
}

export function NameForm({ name }: { name?: string }) {
  const t = useT();
  const { run, pending, shown } = useSubmit();
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const value = String(new FormData(e.currentTarget).get("name") ?? "");
        run(() => updateNameAction(value), "Saved");
      }}
    >
      <Field id="name" label={t("Your name")}>
        <div className="flex gap-2">
          <Input id="name" name="name" defaultValue={name} maxLength={80} autoComplete="name" />
          <Button type="submit" variant="outline" disabled={pending}>
            {t("Save")}
          </Button>
        </div>
      </Field>
      {shown}
    </form>
  );
}

export function ChangeMpinForm() {
  const t = useT();
  const { run, pending, shown } = useSubmit();
  const [formKey, setFormKey] = useState(0);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "");
    run(() => changeMpinAction(value("current"), value("mpin"), value("confirm")), "MPIN changed", () => setFormKey((k) => k + 1));
  }
  return (
    <div className="flex flex-col gap-3">
      <form key={formKey} onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-3 sm:items-end">
        <Field id="current" label={t("Current MPIN")}>
          <PinInput id="current" name="current" secret required className="h-12 text-lg" />
        </Field>
        <Field id="mpin" label={t("New MPIN")}>
          <PinInput id="mpin" name="mpin" secret required autoComplete="new-password" className="h-12 text-lg" />
        </Field>
        <Field id="confirm" label={t("Confirm MPIN")}>
          <PinInput id="confirm" name="confirm" secret required autoComplete="new-password" className="h-12 text-lg" />
        </Field>
        <div className="sm:col-span-3">
          <Button type="submit" disabled={pending}>
            {t("Change MPIN")}
          </Button>
        </div>
      </form>
      {shown}
    </div>
  );
}

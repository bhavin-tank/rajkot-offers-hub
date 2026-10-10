"use client";

import { CircleCheck } from "lucide-react";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { SuccessPanel } from "@/components/marketing/blocks";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, describedBy } from "@/components/ui/field";
import { Input, PhoneInput, Select, Textarea } from "@/components/ui/input";
import { sendContact } from "@/lib/actions/forms";
import { omit } from "@/lib/utils";
import { CONTACT_SUBJECTS, initialFormState, validateContact, type FieldErrors } from "@/lib/validation/forms";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContact, initialFormState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [seenState, setSeenState] = useState(state);

  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") setErrors(state.errors);
  }

  if (state.status === "success") {
    return (
      <SuccessPanel
        icon={CircleCheck}
        title="તમારો સંદેશ મળી ગયો છે"
        text="અમે જલ્દી જવાબ આપીશું."
        actions={
          <ButtonLink href="/" variant="outline">
            હોમ પર જાઓ
          </ButtonLink>
        }
      />
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const found = validateContact(data);
    setErrors(found);
    if (Object.keys(found).length) {
      event.currentTarget.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    startTransition(() => formAction(data));
  }

  const field = (name: string) => ({
    id: name,
    name,
    invalid: Boolean(errors[name]),
    ...describedBy(name, { error: errors[name] }),
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onInput={(e) => {
        const name = (e.target as HTMLInputElement).name;
        if (errors[name]) setErrors((current) => omit(current, name));
      }}
      className="flex flex-col gap-5"
    >
      <h2 className="text-xl font-semibold">સંદેશ મોકલો</h2>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Field id="name" label="નામ" error={errors.name}>
          <Input {...field("name")} autoComplete="name" placeholder="તમારું નામ" />
        </Field>
        <Field id="mobile" label="મોબાઇલ નંબર" error={errors.mobile}>
          <PhoneInput {...field("mobile")} placeholder="98XXX XXXXX" />
        </Field>
      </div>
      <Field id="subject" label="વિષય" error={errors.subject}>
        <Select {...field("subject")} defaultValue="" placeholder="વિષય પસંદ કરો">
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="message" label="સંદેશ" error={errors.message}>
        <Textarea {...field("message")} className="min-h-28 lg:min-h-[140px]" placeholder="તમારો સંદેશ લખો" />
      </Field>
      <Button type="submit" disabled={pending} block>
        {pending ? "મોકલાય છે…" : "સંદેશ મોકલો"}
      </Button>
    </form>
  );
}

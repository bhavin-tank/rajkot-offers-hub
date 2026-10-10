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
        title="We have received your message"
        text="We will reply soon."
        actions={
          <ButtonLink href="/" variant="outline">
            Go to home
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
      <h2 className="text-xl font-semibold">Send message</h2>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          <Input {...field("name")} autoComplete="name" placeholder="Your name" />
        </Field>
        <Field id="mobile" label="Mobile number" error={errors.mobile}>
          <PhoneInput {...field("mobile")} placeholder="98XXX XXXXX" />
        </Field>
      </div>
      <Field id="subject" label="Subject" error={errors.subject}>
        <Select {...field("subject")} defaultValue="" placeholder="Select a subject">
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="message" label="Message" error={errors.message}>
        <Textarea {...field("message")} className="min-h-28 lg:min-h-[140px]" placeholder="Write your message" />
      </Field>
      <Button type="submit" disabled={pending} block>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

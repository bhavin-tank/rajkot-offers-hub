"use client";

import { useActionState, useState } from "react";
import { requestCodeAction, verifyCodeAction } from "@/lib/actions/admin";
import { idle } from "@/lib/admin/state";
import { SubmitButton } from "./action-form";
import { inputClass } from "./ui";

/** Mobile number → 6-digit WhatsApp code. */
export function SignInForm() {
  const [requested, request] = useActionState(requestCodeAction, idle);
  const [verified, verify] = useActionState(verifyCodeAction, idle);
  const [changing, setChanging] = useState(false);
  const sent = requested.status === "success" && requested.data && !changing ? requested.data : null;

  if (!sent) {
    return (
      <form action={(data) => { setChanging(false); request(data); }} className="flex flex-col gap-3">
        <label htmlFor="mobile" className="text-sm font-medium">
          Mobile number
        </label>
        <div className="flex">
          <span className="flex items-center rounded-l-lg border border-r-0 border-input bg-surface px-3 text-sm">+91</span>
          <input id="mobile" name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" required placeholder="98XXX XXXXX" className={`${inputClass} rounded-l-none`} />
        </div>
        {requested.status === "error" && <p role="alert" className="text-sm text-danger">{requested.message}</p>}
        <SubmitButton>Send code on WhatsApp</SubmitButton>
      </form>
    );
  }

  return (
    <form action={verify} className="flex flex-col gap-3">
      <p className="text-sm text-muted">{requested.status === "success" && requested.message}</p>
      <input type="hidden" name="requestId" value={sent.requestId} />
      <label htmlFor="code" className="text-sm font-medium">
        6-digit code
      </label>
      <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="\d{6}" required autoFocus className={`${inputClass} text-center text-lg tracking-[0.4em]`} />
      {verified.status === "error" && <p role="alert" className="text-sm text-danger">{verified.message}</p>}
      <SubmitButton>Sign in</SubmitButton>
      <button type="button" onClick={() => setChanging(true)} className="cursor-pointer text-sm text-muted underline">
        Use another number or resend
      </button>
    </form>
  );
}

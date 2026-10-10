"use client";

import { ArrowRight, CircleCheck } from "lucide-react";
import { startTransition, useActionState, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Area, Category } from "@/types";
import { SuccessPanel } from "@/components/marketing/blocks";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { chipClass } from "@/components/ui/chip";
import { Stepper } from "@/components/ui/display";
import { Field, FieldError, describedBy } from "@/components/ui/field";
import { DateInput, Input, PhoneInput, Select, Textarea } from "@/components/ui/input";
import { submitOffer } from "@/lib/actions/forms";
import { useT } from "@/lib/i18n/client";
import { SUBMIT_OFFER_TYPES } from "@/lib/filters";
import { cn, omit } from "@/lib/utils";
import {
  SUBMIT_STEPS,
  firstStepWithError,
  initialFormState,
  validateSubmitStep,
  type FieldErrors,
} from "@/lib/validation/forms";
import { PhotoPicker } from "./photo-picker";
import { ReviewCard } from "./review-card";

interface SubmitOfferFormProps {
  categories: Pick<Category, "slug" | "shortName">[];
  areas: Area[];
  /** Intro shown above the form on mobile, step 1 only. */
  mobileIntro?: ReactNode;
}

/** Three-step form. All steps stay in one <form> so nothing is lost when moving between them. */
export function SubmitOfferForm({ categories, areas, mobileIntro }: SubmitOfferFormProps) {
  const t = useT();
  const [state, formAction, pending] = useActionState(submitOffer, initialFormState);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [formKey, setFormKey] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [seenState, setSeenState] = useState(state);
  const form = useRef<HTMLFormElement>(null);
  const top = useRef<HTMLDivElement>(null);

  // New server result: show its errors and jump to the first step that has one.
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") {
      setErrors(state.errors);
      const target = firstStepWithError(state.errors);
      if (target >= 0) setStep(target);
    }
  }

  function scrollTop() {
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goTo(next: number) {
    setStep(next);
    scrollTop();
  }

  function next() {
    const data = new FormData(form.current!);
    const stepErrors = validateSubmitStep(step, data);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) {
      form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setValues(Object.fromEntries([...data].filter(([, v]) => typeof v === "string")) as Record<string, string>);
    goTo(step + 1);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < SUBMIT_STEPS.length - 1) return next();
    const data = new FormData(event.currentTarget);
    const stepErrors = validateSubmitStep(step, data);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) return;
    // Submitting by hand keeps the uncontrolled fields filled if the server rejects.
    setDismissed(false);
    startTransition(() => formAction(data));
  }

  function clearError(name: string) {
    if (!errors[name]) return;
    setErrors((current) => omit(current, name));
  }

  if (state.status === "success" && !dismissed) {
    return (
      <SuccessPanel
        icon={CircleCheck}
        title={t("We have received your offer!")}
        text={t("Our team will contact you on WhatsApp after verification.")}
        actions={
          <>
            <ButtonLink href="/">{t("Go to home")}</ButtonLink>
            <Button
              variant="outline"
              onClick={() => {
                setDismissed(true);
                setFormKey((k) => k + 1);
                setStep(0);
                setValues({});
              }}
            >
              {t("Add another offer")}
            </Button>
          </>
        }
      />
    );
  }

  const err = (name: string) => (errors[name] ? t(errors[name]) : undefined);
  const field = (name: string, helper?: string) => ({
    id: name,
    name,
    invalid: Boolean(err(name)),
    ...describedBy(name, { error: err(name), helper }),
  });

  return (
    <div ref={top} className="scroll-mt-20">
      {step === 0 && mobileIntro && <div className="mb-6 lg:hidden">{mobileIntro}</div>}

      <form
        key={formKey}
        ref={form}
        noValidate
        onSubmit={onSubmit}
        onInput={(e) => clearError((e.target as HTMLInputElement).name)}
        className="flex flex-col gap-6 lg:gap-8"
      >
        <Stepper
          title={t(SUBMIT_STEPS[step])}
          step={step + 1}
          total={SUBMIT_STEPS.length}
          stepLabel={t("Step {step} of {total}", { step: step + 1, total: SUBMIT_STEPS.length })}
          labels={SUBMIT_STEPS.map((s) => t(s))}
        />

        {/* Step 1: business */}
        <fieldset hidden={step !== 0} className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <legend className="sr-only">{t(SUBMIT_STEPS[0])}</legend>
          <Field id="businessName" label={t("Business name")} error={err("businessName")}>
            <Input {...field("businessName")} autoComplete="organization" placeholder={t("e.g. Shree Radhe Collection")} />
          </Field>
          <Field id="category" label={t("Category")} error={err("category")}>
            <Select {...field("category")} defaultValue="" placeholder={t("Select a category")} onChange={() => clearError("category")}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.shortName}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="area" label={t("Area")} error={err("area")}>
            <Select {...field("area")} defaultValue="" placeholder={t("Select an area")} onChange={() => clearError("area")}>
              {areas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="address" label={t("Full address")} error={err("address")} className="lg:col-span-2">
            <Textarea {...field("address")} autoComplete="street-address" placeholder={t("Shop number, building, road, landmark")} />
          </Field>
          <Field id="ownerName" label={t("Owner / contact person name")} error={err("ownerName")}>
            <Input {...field("ownerName")} autoComplete="name" placeholder={t("Your name")} />
          </Field>
          <Field id="instagram" label="Instagram" optional error={err("instagram")}>
            <Input {...field("instagram")} placeholder="@yourshop" />
          </Field>
          <div className="flex flex-col gap-3 lg:col-span-2">
            <Field
              id="mobile"
              label={t("Mobile number")}
              error={err("mobile")}
              helper={t("Our team will use this number to verify your offer.")}
            >
              <PhoneInput {...field("mobile", "helper")} placeholder="98XXX XXXXX" />
            </Field>
            <Checkbox name="whatsapp" defaultChecked label={t("This number is on WhatsApp")} />
          </div>
        </fieldset>

        {/* Step 2: offer */}
        <fieldset hidden={step !== 1} className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <legend className="sr-only">{t(SUBMIT_STEPS[1])}</legend>
          <Field
            id="title"
            label={t("Offer title")}
            error={err("title")}
            helper={t('Keep it short and clear, e.g. "20% off on all kurtas"')}
            className="lg:col-span-2"
          >
            <Input {...field("title", "helper")} maxLength={80} placeholder={t("20% off on all kurtas")} />
          </Field>
          <fieldset className="flex flex-col gap-2 lg:col-span-2">
            <legend className="mb-2 text-sm font-medium">{t("Offer type")}</legend>
            <div className="flex flex-wrap gap-2">
              {SUBMIT_OFFER_TYPES.map((type, i) => (
                <label key={type.value} className="cursor-pointer">
                  <input type="radio" name="type" value={type.value} defaultChecked={i === 0} className="peer sr-only" />
                  <span
                    className={cn(
                      chipClass({ size: "xl", tone: "brand" }),
                      "peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:font-semibold peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
                    )}
                  >
                    {t(type.label)}
                  </span>
                </label>
              ))}
            </div>
            {err("type") && <FieldError>{err("type")}</FieldError>}
          </fieldset>
          <Field id="description" label={t("Offer description")} error={err("description")} className="lg:col-span-2">
            <Textarea
              {...field("description")}
              className="min-h-28"
              placeholder={t("Which items does the offer apply to? What should customers do to get it?")}
            />
          </Field>
          <Field id="terms" label={t("Terms and conditions")} optional className="lg:col-span-2">
            <Textarea {...field("terms")} placeholder={t("e.g. On a minimum purchase of ₹999, not valid with other offers")} />
          </Field>
          <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:gap-6">
            <Field id="startDate" label={t("Start date")} error={err("startDate")}>
              <DateInput {...field("startDate")} />
            </Field>
            <Field id="endDate" label={t("End date")} error={err("endDate")}>
              <DateInput {...field("endDate")} />
            </Field>
          </div>
        </fieldset>

        {/* Step 3: photos and confirmation */}
        <fieldset hidden={step !== 2} className="flex flex-col gap-6">
          <legend className="sr-only">{t(SUBMIT_STEPS[2])}</legend>
          <PhotoPicker error={err("photos")} />
          <ReviewCard values={values} categories={categories} areas={areas} onEdit={goTo} />
          <div className="flex flex-col gap-2">
            <Checkbox
              name="confirm"
              label={t("I confirm that the offer details provided are correct.")}
              aria-invalid={err("confirm") ? true : undefined}
              onChange={() => clearError("confirm")}
            />
            {err("confirm") && <FieldError>{err("confirm")}</FieldError>}
          </div>
        </fieldset>

        <div
          className={cn(
            "flex flex-col gap-3 lg:flex-row lg:items-center lg:border-t lg:border-line lg:pt-6",
            step === 1 && "grid grid-cols-[1fr_2fr] lg:flex",
          )}
        >
          {err("form") ? (
            <p role="alert" className="text-[13px] text-danger lg:mr-auto">
              {err("form")}
            </p>
          ) : (
            <p className="hidden text-[13px] text-muted lg:mr-auto lg:block">{t("Takes about 2–3 minutes")}</p>
          )}
          {step > 0 && (
            <Button variant="outline" onClick={() => goTo(step - 1)} className={cn(step === 2 && "order-2 lg:order-none", "lg:px-7")}>
              {t("Back")}
            </Button>
          )}
          <Button type="submit" disabled={pending} className="lg:px-7">
            {step === SUBMIT_STEPS.length - 1 ? (pending ? t("Sending…") : t("Submit an offer")) : t("Next")}
            {step < SUBMIT_STEPS.length - 1 && <ArrowRight size={18} strokeWidth={2} aria-hidden />}
          </Button>
        </div>
      </form>
    </div>
  );
}

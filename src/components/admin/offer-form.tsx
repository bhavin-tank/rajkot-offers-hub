"use client";

import { useState } from "react";
import type { AdminState } from "@/lib/admin/state";
import { ActionForm, FormField, SubmitButton } from "./action-form";
import { I18nField } from "./i18n-field";
import { ImageListField } from "./image-field";
import { Card, inputClass } from "./ui";

type Text = { en: string; gu?: string };

export interface OfferFormValues {
  businessId: string;
  title: Text;
  badge: Text;
  type: string;
  discount: number;
  categorySlug: string;
  subcategory?: string;
  offerText?: Text;
  images: string[];
  validFrom: string;
  validTo: string;
  timings: Text;
  steps: Text[];
  terms: Text[];
  featured: boolean;
}

export interface CategoryOption {
  slug: string;
  name: string;
  subcategories: string[];
}

const TYPES = [
  ["percent", "% discount"],
  ["flat", "Flat discount"],
  ["bogo", "Buy 1 get 1"],
  ["combo", "Combo"],
  ["other", "Other"],
] as const;

const joinLines = (items: Text[], lang: "en" | "gu") => items.map((t) => (lang === "en" ? t.en : (t.gu ?? ""))).join("\n");

export function OfferForm({
  values,
  businesses,
  categories,
  action,
  isNew,
}: {
  values: OfferFormValues;
  businesses: { id: string; name: string; areaSlug: string }[];
  categories: CategoryOption[];
  action: (state: AdminState, data: FormData) => Promise<AdminState>;
  isNew: boolean;
}) {
  const [category, setCategory] = useState(values.categorySlug);
  const subcategories = categories.find((c) => c.slug === category)?.subcategories ?? [];

  return (
    <ActionForm action={action} className="gap-5">
      <Card title="Offer">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Business" name="businessId">
              <select id="businessId" name="businessId" defaultValue={values.businessId} className={inputClass} required>
                <option value="" disabled>
                  Choose a business
                </option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} · {b.areaSlug}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Category" name="categorySlug">
                <select id="categorySlug" name="categorySlug" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  <option value="" disabled>
                    Choose
                  </option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Subcategory" name="subcategory">
                <select id="subcategory" name="subcategory" defaultValue={values.subcategory ?? ""} key={category} className={inputClass}>
                  <option value="">None</option>
                  {subcategories.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>
          <I18nField name="title" label="Title" defaultValue={values.title} maxLength={80} hint="Short and clear, e.g. “20% off on all kurtas”." />
          <I18nField name="badge" label="Badge" defaultValue={values.badge} maxLength={24} hint="Shown on the card: “30% OFF”, “1 + 1”." />
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <FormField label="Type" name="type">
              <select id="type" name="type" defaultValue={values.type} className={inputClass}>
                {TYPES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Discount %" name="discount" hint="For sorting">
              <input id="discount" name="discount" type="number" min={0} max={100} defaultValue={values.discount} className={`${inputClass} w-28`} />
            </FormField>
          </div>
          <I18nField name="offerText" label="One-line summary" defaultValue={values.offerText} required={false} maxLength={200} multiline />
        </div>
      </Card>

      <Card title="Dates and timings">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First day" name="validFrom">
            <input id="validFrom" name="validFrom" type="date" defaultValue={values.validFrom} className={inputClass} />
          </FormField>
          <FormField label="Last day" name="validTo">
            <input id="validTo" name="validTo" type="date" defaultValue={values.validTo} className={inputClass} />
          </FormField>
          <div className="sm:col-span-2">
            <I18nField name="timings" label="Timings" defaultValue={values.timings} maxLength={60} />
          </div>
        </div>
      </Card>

      <Card title="Photos">
        <ImageListField name="images" label="Offer photos" defaultValue={values.images} max={5} purpose="offer" />
      </Card>

      <Card title="How to redeem and terms">
        <div className="grid gap-4">
          <I18nField name="steps" label="Steps (one per line)" defaultValue={{ en: joinLines(values.steps, "en"), gu: joinLines(values.steps, "gu") }} multiline hint="Gujarati lines pair with English lines in order." />
          <I18nField name="terms" label="Terms (one per line)" defaultValue={{ en: joinLines(values.terms, "en"), gu: joinLines(values.terms, "gu") }} multiline />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={values.featured} className="size-4 accent-primary" />
            Feature on the home page
          </label>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap gap-2 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:mx-0 lg:rounded-xl lg:border">
        {isNew ? (
          <>
            <SubmitButton name="intent" value="approved">
              Create and publish
            </SubmitButton>
            <SubmitButton name="intent" value="draft" variant="outline">
              Save as draft
            </SubmitButton>
          </>
        ) : (
          <SubmitButton>Save changes</SubmitButton>
        )}
      </div>
    </ActionForm>
  );
}

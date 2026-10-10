"use client";

import type { AdminState } from "@/lib/admin/state";
import { ActionForm, FormField, SubmitButton, useFieldError } from "./action-form";
import { I18nField } from "./i18n-field";
import { ImageListField } from "./image-field";
import { Card, inputClass } from "./ui";

export interface BusinessFormValues {
  name: string;
  categorySlug: string;
  areaSlug: string;
  about: { en: string; gu?: string };
  addressLine: string;
  postalCode: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  website?: string;
  hours: { day: number; opens: string | null; closes: string | null }[];
  cover: string;
  photos: string[];
  lat: number;
  lng: number;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function HoursField({ hours }: { hours: BusinessFormValues["hours"] }) {
  const error = useFieldError("hours");
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">Opening hours</legend>
      {DAYS.map((label, day) => {
        const h = hours.find((x) => x.day === day);
        return (
          <div key={day} className="grid grid-cols-[96px_1fr_1fr_auto] items-center gap-2 text-sm">
            <span>{label}</span>
            <input type="time" name={`hours.${day}.opens`} defaultValue={h?.opens ?? ""} aria-label={`${label} opens`} className={inputClass} />
            <input type="time" name={`hours.${day}.closes`} defaultValue={h?.closes ?? ""} aria-label={`${label} closes`} className={inputClass} />
            <label className="flex items-center gap-1.5 text-xs text-muted">
              <input type="checkbox" name={`hours.${day}.closed`} defaultChecked={h ? h.opens === null : false} /> Closed
            </label>
          </div>
        );
      })}
      {error && <p className="text-xs text-danger">{error}</p>}
    </fieldset>
  );
}

export function BusinessForm({
  values,
  categories,
  areas,
  action,
  isNew,
}: {
  values: BusinessFormValues;
  categories: { slug: string; name: string }[];
  areas: { slug: string; name: string }[];
  action: (state: AdminState, data: FormData) => Promise<AdminState>;
  isNew: boolean;
}) {
  return (
    <ActionForm action={action} className="gap-5">
      <Card title="Profile">
        <div className="grid gap-4">
          <FormField label="Name" name="name">
            <input id="name" name="name" defaultValue={values.name} maxLength={120} className={inputClass} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Category" name="categorySlug">
              <select id="categorySlug" name="categorySlug" defaultValue={values.categorySlug} className={inputClass}>
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
            <FormField label="Area" name="areaSlug">
              <select id="areaSlug" name="areaSlug" defaultValue={values.areaSlug} className={inputClass}>
                <option value="" disabled>
                  Choose
                </option>
                {areas.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <I18nField name="about" label="About" defaultValue={values.about} multiline maxLength={1000} />
        </div>
      </Card>

      <Card title="Contact and address">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone" name="phone">
            <input id="phone" name="phone" defaultValue={values.phone} placeholder="+91 98765 43210" className={inputClass} />
          </FormField>
          <FormField label="WhatsApp" name="whatsapp">
            <input id="whatsapp" name="whatsapp" defaultValue={values.whatsapp} placeholder="+91 98765 43210" className={inputClass} />
          </FormField>
          <FormField label="Instagram (optional)" name="instagram">
            <input id="instagram" name="instagram" defaultValue={values.instagram} placeholder="@shop" className={inputClass} />
          </FormField>
          <FormField label="Website (optional)" name="website">
            <input id="website" name="website" defaultValue={values.website} placeholder="https://…" className={inputClass} />
          </FormField>
          <FormField label="Street address" name="addressLine" className="sm:col-span-2" hint="Shop number, building and road. “Rajkot” and the PIN code are added automatically.">
            <input id="addressLine" name="addressLine" defaultValue={values.addressLine} className={inputClass} />
          </FormField>
          <FormField label="PIN code" name="postalCode">
            <input id="postalCode" name="postalCode" defaultValue={values.postalCode} inputMode="numeric" maxLength={6} className={inputClass} />
          </FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Latitude" name="lat">
              <input id="lat" name="lat" defaultValue={values.lat} inputMode="decimal" className={inputClass} />
            </FormField>
            <FormField label="Longitude" name="lng">
              <input id="lng" name="lng" defaultValue={values.lng} inputMode="decimal" className={inputClass} />
            </FormField>
          </div>
          <p className="text-xs text-muted sm:col-span-2">
            Location: in Google Maps, right-click the shop and click the coordinates to copy them.
          </p>
        </div>
      </Card>

      <Card title="Hours">
        <HoursField hours={values.hours} />
      </Card>

      <Card title="Photos">
        <div className="grid gap-5">
          <ImageListField name="cover" label="Cover photo" defaultValue={values.cover ? [values.cover] : []} max={1} purpose="business_cover" />
          <ImageListField name="photos" label="Gallery" defaultValue={values.photos} max={12} purpose="business_photo" />
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:mx-0 lg:rounded-xl lg:border">
        <SubmitButton>{isNew ? "Create business" : "Save changes"}</SubmitButton>
      </div>
    </ActionForm>
  );
}

"use client";

import type { AdminState } from "@/lib/admin/state";
import { ActionForm, FormField, SubmitButton } from "./action-form";
import { I18nField } from "./i18n-field";
import { ImageListField } from "./image-field";
import { Card, inputClass, textareaClass } from "./ui";

export interface CategoryFormValues {
  slug: string;
  name: { en: string; gu?: string };
  shortName: { en: string; gu?: string };
  icon: string;
  image: string;
  description: { en: string; gu?: string };
  subcategories: { value: string; name: { en: string; gu?: string } }[];
  inHomeRow: boolean;
  featured: boolean;
  sortOrder: number;
  isActive: boolean;
}

const ICONS = ["utensils", "shirt", "scissors", "smartphone", "dumbbell", "sofa", "wrench", "gift", "ticket"];

export function CategoryForm({ values, action, isNew }: { values: CategoryFormValues; action: (state: AdminState, data: FormData) => Promise<AdminState>; isNew: boolean }) {
  return (
    <ActionForm action={action} className="gap-5">
      <Card>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Slug" name="slug" hint={isNew ? "Used in URLs; can't be changed later." : "Fixed once created."}>
              <input id="slug" name="slug" defaultValue={values.slug} readOnly={!isNew} className={inputClass} placeholder="e.g. pets" />
            </FormField>
            <FormField label="Icon" name="icon">
              <select id="icon" name="icon" defaultValue={values.icon} className={inputClass}>
                {ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Order" name="sortOrder">
              <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={values.sortOrder} className={inputClass} />
            </FormField>
          </div>
          <I18nField name="name" label="Name" defaultValue={values.name} maxLength={60} />
          <I18nField name="shortName" label="Short name (chips and the home row)" defaultValue={values.shortName} maxLength={24} />
          <I18nField name="description" label="Description" defaultValue={values.description} maxLength={200} multiline />
          <FormField label="Subcategories" name="subcategories" hint="One per line: “English” or “English | ગુજરાતી”. The English name is the URL filter value.">
            <textarea
              id="subcategories"
              name="subcategories"
              defaultValue={values.subcategories.map((s) => (s.name.gu ? `${s.value} | ${s.name.gu}` : s.value)).join("\n")}
              className={textareaClass}
            />
          </FormField>
          <ImageListField name="image" label="Image" defaultValue={values.image ? [values.image] : []} max={1} purpose="category" />
          <div className="flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked={values.isActive} className="size-4 accent-primary" /> Visible on the site
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="inHomeRow" defaultChecked={values.inHomeRow} className="size-4 accent-primary" /> In the home icon row
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="featured" defaultChecked={values.featured} className="size-4 accent-primary" /> Seasonal banner
            </label>
          </div>
        </div>
      </Card>
      <div>
        <SubmitButton>{isNew ? "Create category" : "Save changes"}</SubmitButton>
      </div>
    </ActionForm>
  );
}

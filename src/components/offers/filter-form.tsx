import { Form } from "@/components/i18n/link";
import { Link } from "@/components/i18n/link";
import type { OfferFilters } from "@/types";
import { buttonClass } from "@/components/ui/button";
import { Radio } from "@/components/ui/checkbox";
import { chipClass } from "@/components/ui/chip";
import { OFFER_TYPES, VALIDITY_OPTIONS } from "@/lib/filters";
import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

interface FilterFormProps {
  /** Page the form submits to, e.g. "/offers" or "/categories/food". */
  action: string;
  filters: OfferFilters;
  /** Keep the category in the query (only on /offers). */
  keepCategory?: boolean;
  /** "sidebar": desktop card. "sheet": inside the mobile sheet. */
  variant: "sidebar" | "sheet";
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-xs font-semibold tracking-[0.04em] text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

/**
 * Offer type and validity filters as a plain GET form, so filtering
 * works without JavaScript and every state is a shareable URL.
 */
export async function FilterForm({ action, filters, keepCategory, variant }: FilterFormProps) {
  const t = await getT();
  const sheet = variant === "sheet";
  return (
    <Form action={action} scroll={false} className="flex flex-col gap-6">
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      {keepCategory && filters.category && <input type="hidden" name="category" value={filters.category} />}
      {filters.subcategory && <input type="hidden" name="sub" value={filters.subcategory} />}
      {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}

      <Group title={t("Offer type")}>
        <div className="flex flex-wrap gap-2">
          {[{ value: "", label: "All" as const }, ...OFFER_TYPES].map((type) => (
            <label key={type.value} className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value={type.value}
                defaultChecked={(filters.type ?? "") === type.value}
                className="peer sr-only"
              />
              <span
                className={cn(
                  chipClass({ size: "sm" }),
                  "peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
                )}
              >
                {t(type.label)}
              </span>
            </label>
          ))}
        </div>
      </Group>

      <Group title={t("Validity")}>
        <div className={cn("flex flex-col gap-3", sheet && "flex-row flex-wrap gap-x-6")}>
          {[{ value: "", label: "Any" as const }, ...VALIDITY_OPTIONS].map((option) => (
            <Radio
              key={option.value}
              name="validity"
              value={option.value}
              defaultChecked={(filters.validity ?? "") === option.value}
              label={t(option.label)}
            />
          ))}
        </div>
      </Group>

      <div className={cn("flex items-center gap-3", sheet && "sticky bottom-0 -mx-5 border-t border-line bg-white px-5 pt-4")}>
        {sheet && (
          <Link href={action} scroll={false} className={buttonClass({ variant: "ghost", className: "px-3" })}>
            {t("Reset")}
          </Link>
        )}
        <button type="submit" className={buttonClass({ block: true })}>
          {t("Show offers")}
        </button>
      </div>
    </Form>
  );
}

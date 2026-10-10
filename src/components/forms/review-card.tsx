import type { Area, Category } from "@/types";
import { SUBMIT_OFFER_TYPES } from "@/lib/filters";
import { formatRange } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n/client";

interface ReviewCardProps {
  values: Record<string, string>;
  categories: Pick<Category, "slug" | "shortName">[];
  areas: Area[];
  /** Jump back to a step (0-based) to edit it. */
  onEdit: (step: number) => void;
}

/** Summary of steps 1 and 2 before the final submit. */
export function ReviewCard({ values, categories, areas, onEdit }: ReviewCardProps) {
  const t = useT();
  const locale = useLocale();
  const area = areas.find((a) => a.slug === values.area)?.name;
  const category = categories.find((c) => c.slug === values.category)?.shortName;
  const typeLabel = SUBMIT_OFFER_TYPES.find((o) => o.value === values.type)?.label;
  const type = typeLabel && t(typeLabel);
  const dates =
    values.startDate && values.endDate ? formatRange(values.startDate, values.endDate, locale) : undefined;

  const sections = [
    {
      title: t("Business details"),
      step: 0,
      rows: [
        [t("Business"), values.businessName],
        [t("Category"), category],
        [t("Area"), area],
        [t("Mobile"), values.mobile && `+91 ${values.mobile}${values.whatsapp ? " · WhatsApp" : ""}`],
      ],
    },
    {
      title: t("Offer details"),
      step: 1,
      rows: [
        [t("Title"), values.title],
        [t("Type"), type],
        [t("Dates"), dates],
      ],
    },
  ];

  return (
    <section className="rounded-2xl border border-line p-4 lg:p-5">
      <h3 className="mb-3 text-[13px] font-semibold text-muted">{t("Review")}</h3>
      <div className="flex flex-col divide-y divide-line">
        {sections.map((section) => (
          <div key={section.title} className="py-3 first:pt-0 last:pb-0">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">{section.title}</h4>
              <button
                type="button"
                onClick={() => onEdit(section.step)}
                className="cursor-pointer text-[13px] font-semibold text-primary hover:underline"
              >
                {t("Edit")}
              </button>
            </div>
            <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-1.5 text-[13px]">
              {section.rows.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted">{label}</dt>
                  <dd className="break-words">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { Area, Category } from "@/types";
import { SUBMIT_OFFER_TYPES } from "@/lib/filters";
import { formatRange } from "@/lib/format";

interface ReviewCardProps {
  values: Record<string, string>;
  categories: Pick<Category, "slug" | "shortName">[];
  areas: Area[];
  /** Jump back to a step (0-based) to edit it. */
  onEdit: (step: number) => void;
}

/** Summary of steps 1 and 2 before the final submit. */
export function ReviewCard({ values, categories, areas, onEdit }: ReviewCardProps) {
  const area = areas.find((a) => a.slug === values.area)?.nameGu;
  const category = categories.find((c) => c.slug === values.category)?.shortName;
  const type = SUBMIT_OFFER_TYPES.find((t) => t.value === values.type)?.label;
  const dates =
    values.startDate && values.endDate ? formatRange(values.startDate, values.endDate) : undefined;

  const sections = [
    {
      title: "બિઝનેસની માહિતી",
      step: 0,
      rows: [
        ["બિઝનેસ", values.businessName],
        ["કેટેગરી", category],
        ["વિસ્તાર", area],
        ["મોબાઇલ", values.mobile && `+91 ${values.mobile}${values.whatsapp ? " · WhatsApp" : ""}`],
      ],
    },
    {
      title: "ઓફરની વિગતો",
      step: 1,
      rows: [
        ["શીર્ષક", values.title],
        ["પ્રકાર", type],
        ["તારીખ", dates],
      ],
    },
  ];

  return (
    <section className="rounded-2xl border border-line p-4 lg:p-5">
      <h3 className="mb-3 text-[13px] font-semibold text-muted">સમીક્ષા</h3>
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
                ફેરફાર કરો
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

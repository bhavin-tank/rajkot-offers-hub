import { BadgeCheck } from "lucide-react";
import type { Review } from "@/types";
import { Stars } from "@/components/ui/rating";
import { formatShortDate } from "@/lib/format";
import { getLocale, getT } from "@/lib/i18n/server";

/** The newest reviews, each with its stars, text and the outlet it is about. Renders nothing without reviews. */
export async function ReviewList({ reviews, total, title }: { reviews: Review[]; total: number; title?: string }) {
  if (!reviews.length) return null;
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <section aria-label={title ?? t("Reviews")}>
      <h2 className="mb-3 text-lg font-semibold lg:text-[22px]">
        {title ?? t("Reviews")} <span className="font-normal text-muted">({total})</span>
      </h2>
      <ul className="flex flex-col divide-y divide-line">
        {reviews.map((review) => (
          <li key={review.id} className="py-5 first:pt-1 last:pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold">{review.author}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                  {[review.outlet, formatShortDate(review.date, locale)].filter(Boolean).join(" · ")}
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 font-medium text-open">
                      <BadgeCheck size={14} aria-hidden />
                      {t("Used this offer")}
                    </span>
                  )}
                </p>
              </div>
              <Stars value={review.rating} label={t("{rating} out of 5", { rating: review.rating })} className="mt-0.5 shrink-0" />
            </div>
            {review.title && <p className="mt-3 text-[15px] font-semibold">{review.title}</p>}
            {review.body && <p className={`${review.title ? "mt-1" : "mt-3"} text-sm leading-relaxed text-muted`}>{review.body}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

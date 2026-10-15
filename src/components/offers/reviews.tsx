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
      <ul className="flex flex-col gap-3">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-2xl border border-line p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Stars value={review.rating} label={t("{rating} out of 5", { rating: review.rating })} />
              {review.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-open">
                  <BadgeCheck size={14} aria-hidden />
                  {t("Used this offer")}
                </span>
              )}
            </div>
            {review.title && <p className="mt-2 text-[15px] font-semibold">{review.title}</p>}
            {review.body && <p className="mt-1 text-sm leading-relaxed text-muted">{review.body}</p>}
            <p className="mt-2 text-xs text-muted">
              {[review.author, review.outlet, formatShortDate(review.date, locale)].filter(Boolean).join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

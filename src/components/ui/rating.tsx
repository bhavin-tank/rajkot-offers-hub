import { Star } from "lucide-react";
import type { Rating } from "@/types";
import { cn } from "@/lib/utils";

/** "★ 4.5 (12)" for cards and headers. */
export function RatingInline({ rating, className }: { rating: Rating; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star size={13} aria-hidden className="fill-amber-400 text-amber-400" />
      <span className="font-medium text-ink">{rating.avg.toFixed(1)}</span>
      <span>({rating.count})</span>
    </span>
  );
}

/** Five stars filled up to `value` (1–5), for one review. */
export function Stars({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <span role="img" aria-label={label} className={cn("inline-flex gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={14} aria-hidden className={i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-line-strong"} />
      ))}
    </span>
  );
}

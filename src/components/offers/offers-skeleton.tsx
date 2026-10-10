import { Skeleton } from "@/components/ui/display";
import { OfferGridSkeleton } from "./offer-card";

/** Placeholder for an offer list while it loads. */
export function OffersSkeleton() {
  return (
    <div aria-busy="true" aria-label="ઓફર્સ લોડ થાય છે">
      <Skeleton className="h-8 w-40 lg:h-10 lg:w-56" />
      <Skeleton className="mt-2.5 h-4 w-48" />
      <div className="no-scrollbar mt-6 flex gap-2 overflow-hidden lg:mt-10">
        {[56, 88, 64, 96, 72, 80].map((w, i) => (
          <Skeleton key={i} className="h-9 shrink-0 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <Skeleton className="mt-5 mb-4 h-4 w-20" />
      <OfferGridSkeleton />
    </div>
  );
}

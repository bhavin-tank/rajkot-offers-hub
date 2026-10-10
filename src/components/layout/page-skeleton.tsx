import { Skeleton } from "@/components/ui/display";
import { Container } from "./container";

/** Fallback for detail pages while their params and data resolve. */
export function DetailSkeleton() {
  return (
    <Container aria-busy="true" className="px-0 pb-10 lg:px-5 lg:pt-6">
      <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:gap-12">
        <Skeleton className="aspect-[4/3] rounded-none lg:rounded-2xl" />
        <div className="flex flex-col gap-4 px-5 pt-6 lg:px-0 lg:pt-0">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-11 w-3/5" />
          <Skeleton className="mt-4 h-12 w-full" />
        </div>
      </div>
    </Container>
  );
}

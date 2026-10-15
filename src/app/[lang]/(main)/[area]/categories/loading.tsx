import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/display";

export default function Loading() {
  return (
    <Container aria-busy="true" className="flex flex-col gap-6 py-8 lg:py-14">
      <Skeleton className="h-9 w-2/5" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    </Container>
  );
}

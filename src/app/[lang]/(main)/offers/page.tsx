import { OffersView, offersMetadata } from "@/components/pages/offers-view";

export function generateMetadata() {
  return offersMetadata();
}

export default function OffersPage({ searchParams }: PageProps<"/[lang]/offers">) {
  return <OffersView searchParams={searchParams} />;
}

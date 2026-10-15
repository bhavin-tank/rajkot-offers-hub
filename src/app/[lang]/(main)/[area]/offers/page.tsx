import { OffersView, offersMetadata } from "@/components/pages/offers-view";

export async function generateMetadata({ params }: PageProps<"/[lang]/[area]/offers">) {
  return offersMetadata((await params).area);
}

export default async function AreaOffersPage({ params, searchParams }: PageProps<"/[lang]/[area]/offers">) {
  return <OffersView area={(await params).area} searchParams={searchParams} />;
}

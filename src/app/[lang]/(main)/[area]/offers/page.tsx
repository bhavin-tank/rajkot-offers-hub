import { OffersView, offersMetadata } from "@/components/pages/offers-view";
import { getAreaSlugs } from "@/lib/data";
import { atLeastOne, NO_PARAM } from "@/lib/static-params";

export async function generateStaticParams() {
  return atLeastOne((await getAreaSlugs()).map((area) => ({ area })), { area: NO_PARAM });
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[area]/offers">) {
  return offersMetadata((await params).area);
}

export default async function AreaOffersPage({ params, searchParams }: PageProps<"/[lang]/[area]/offers">) {
  return <OffersView area={(await params).area} searchParams={searchParams} />;
}

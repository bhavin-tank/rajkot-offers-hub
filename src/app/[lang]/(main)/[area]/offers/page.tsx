import { OffersView, offersMetadata } from "@/components/pages/offers-view";
import { getAreaSlugs } from "@/lib/data";

export async function generateStaticParams() {
  return (await getAreaSlugs()).map((area) => ({ area }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[area]/offers">) {
  return offersMetadata((await params).area);
}

export default async function AreaOffersPage({ params, searchParams }: PageProps<"/[lang]/[area]/offers">) {
  return <OffersView area={(await params).area} searchParams={searchParams} />;
}

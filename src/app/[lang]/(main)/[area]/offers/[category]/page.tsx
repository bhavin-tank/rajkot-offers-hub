import { OffersView, offersMetadata } from "@/components/pages/offers-view";
import { getAreaSlugs, getCategorySlugs } from "@/lib/data";

export function generateStaticParams() {
  return getAreaSlugs().flatMap((area) => getCategorySlugs().map((category) => ({ area, category })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[area]/offers/[category]">) {
  const { area, category } = await params;
  return offersMetadata(area, category);
}

export default async function AreaCategoryOffersPage({
  params,
  searchParams,
}: PageProps<"/[lang]/[area]/offers/[category]">) {
  const { area, category } = await params;
  return <OffersView area={area} category={category} searchParams={searchParams} />;
}

import { OffersView, offersMetadata } from "@/components/pages/offers-view";
import { getAreaSlugs, getCategorySlugs } from "@/lib/data";

export async function generateStaticParams() {
  const [areas, categories] = await Promise.all([getAreaSlugs(), getCategorySlugs()]);
  return areas.flatMap((area) => categories.map((category) => ({ area, category })));
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

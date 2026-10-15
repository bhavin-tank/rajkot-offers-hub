import { OffersView, offersMetadata } from "@/components/pages/offers-view";

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

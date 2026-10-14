import { CategoryView, categoryMetadata } from "@/components/pages/category-view";
import { getAreaSlugs, getCategorySlugs } from "@/lib/data";
import { atLeastOne, NO_PARAM } from "@/lib/static-params";

export async function generateStaticParams() {
  const [areas, categories] = await Promise.all([getAreaSlugs(), getCategorySlugs()]);
  return atLeastOne(areas.flatMap((area) => categories.map((slug) => ({ area, slug }))), { area: NO_PARAM, slug: NO_PARAM });
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[area]/categories/[slug]">) {
  const { area, slug } = await params;
  return categoryMetadata(slug, area);
}

export default async function AreaCategoryPage({ params, searchParams }: PageProps<"/[lang]/[area]/categories/[slug]">) {
  const { area, slug } = await params;
  return <CategoryView slug={slug} area={area} searchParams={searchParams} />;
}

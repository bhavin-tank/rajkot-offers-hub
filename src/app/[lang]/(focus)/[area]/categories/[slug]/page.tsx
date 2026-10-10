import { CategoryView, categoryMetadata } from "@/components/pages/category-view";
import { getAreaSlugs, getCategorySlugs } from "@/lib/data";

export async function generateStaticParams() {
  const [areas, categories] = await Promise.all([getAreaSlugs(), getCategorySlugs()]);
  return areas.flatMap((area) => categories.map((slug) => ({ area, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[area]/categories/[slug]">) {
  const { area, slug } = await params;
  return categoryMetadata(slug, area);
}

export default async function AreaCategoryPage({ params, searchParams }: PageProps<"/[lang]/[area]/categories/[slug]">) {
  const { area, slug } = await params;
  return <CategoryView slug={slug} area={area} searchParams={searchParams} />;
}

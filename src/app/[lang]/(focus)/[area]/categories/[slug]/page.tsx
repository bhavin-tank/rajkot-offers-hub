import { CategoryView, categoryMetadata } from "@/components/pages/category-view";
import { getAreaSlugs, getCategorySlugs } from "@/lib/data";

export function generateStaticParams() {
  return getAreaSlugs().flatMap((area) => getCategorySlugs().map((slug) => ({ area, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[area]/categories/[slug]">) {
  return categoryMetadata((await params).slug);
}

export default async function AreaCategoryPage({ params, searchParams }: PageProps<"/[lang]/[area]/categories/[slug]">) {
  const { area, slug } = await params;
  return <CategoryView slug={slug} area={area} searchParams={searchParams} />;
}

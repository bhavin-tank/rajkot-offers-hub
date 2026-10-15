import { CategoryView, categoryMetadata } from "@/components/pages/category-view";

export async function generateMetadata({ params }: PageProps<"/[lang]/[area]/categories/[slug]">) {
  const { area, slug } = await params;
  return categoryMetadata(slug, area);
}

export default async function AreaCategoryPage({ params, searchParams }: PageProps<"/[lang]/[area]/categories/[slug]">) {
  const { area, slug } = await params;
  return <CategoryView slug={slug} area={area} searchParams={searchParams} />;
}

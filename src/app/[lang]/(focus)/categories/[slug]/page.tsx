import { CategoryView, categoryMetadata } from "@/components/pages/category-view";
import { getCategorySlugs } from "@/lib/data";
import { atLeastOne, NO_PARAM } from "@/lib/static-params";

export async function generateStaticParams() {
  return atLeastOne((await getCategorySlugs()).map((slug) => ({ slug })), { slug: NO_PARAM });
}

export async function generateMetadata({ params }: PageProps<"/[lang]/categories/[slug]">) {
  return categoryMetadata((await params).slug);
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/categories/[slug]">) {
  return <CategoryView slug={(await params).slug} searchParams={searchParams} />;
}

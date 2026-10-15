import { CategoryView, categoryMetadata } from "@/components/pages/category-view";

export async function generateMetadata({ params }: PageProps<"/[lang]/categories/[slug]">) {
  return categoryMetadata((await params).slug);
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/categories/[slug]">) {
  return <CategoryView slug={(await params).slug} searchParams={searchParams} />;
}

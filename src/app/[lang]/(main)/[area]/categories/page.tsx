import { CategoriesView, categoriesMetadata } from "@/components/pages/categories-view";
import { getAreaSlugs } from "@/lib/data";

export async function generateStaticParams() {
  return (await getAreaSlugs()).map((area) => ({ area }));
}

export function generateMetadata() {
  return categoriesMetadata();
}

export default async function AreaCategoriesPage({ params }: PageProps<"/[lang]/[area]/categories">) {
  return <CategoriesView area={(await params).area} />;
}

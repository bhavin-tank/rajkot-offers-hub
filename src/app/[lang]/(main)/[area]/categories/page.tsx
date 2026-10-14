import { CategoriesView, categoriesMetadata } from "@/components/pages/categories-view";
import { getAreaSlugs } from "@/lib/data";
import { atLeastOne, NO_PARAM } from "@/lib/static-params";

export async function generateStaticParams() {
  return atLeastOne((await getAreaSlugs()).map((area) => ({ area })), { area: NO_PARAM });
}

export function generateMetadata() {
  return categoriesMetadata();
}

export default async function AreaCategoriesPage({ params }: PageProps<"/[lang]/[area]/categories">) {
  return <CategoriesView area={(await params).area} />;
}

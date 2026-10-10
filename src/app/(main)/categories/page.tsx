import type { Metadata } from "next";
import {
  AreaPills,
  CategoryBanner,
  CategoryImageGrid,
  categoryHref,
} from "@/components/categories/category-tiles";
import { Container, PageTitle } from "@/components/layout/container";
import { getAreas, getCategories } from "@/lib/data";
import { formatOfferCount } from "@/lib/format";

export const metadata: Metadata = {
  title: "Category",
  description: "Find Rajkot's offers by category: food, fashion, beauty and more.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const featured = categories.find((c) => c.featured);
  const grid = categories.filter((c) => !c.featured);

  return (
    <Container className="flex flex-col gap-8 pt-6 pb-10 lg:gap-14 lg:pt-12 lg:pb-20">
      <PageTitle title="Category" subtitle="What are you looking for? Pick a category" />

      {featured && (
        <CategoryBanner
          eyebrow="This season"
          title={featured.name}
          description={featured.description}
          image={featured.image}
          href={categoryHref(featured.slug)}
          cta={formatOfferCount(featured.offerCount)}
        />
      )}

      <CategoryImageGrid categories={grid} />

      <section id="areas" className="scroll-mt-20">
        <h2 className="mb-4 text-xl font-semibold lg:mb-6 lg:text-[28px]">Browse by area</h2>
        <AreaPills areas={getAreas()} />
      </section>
    </Container>
  );
}

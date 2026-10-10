import type { Metadata } from "next";
import {
  AreaPills,
  CategoryBanner,
  CategoryImageGrid,
  categoryHref,
} from "@/components/categories/category-tiles";
import { Container, PageTitle } from "@/components/layout/container";
import { getAreas, getCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "કેટેગરી",
  description: "ખાણી-પીણી, ફેશન, બ્યુટી અને બીજી કેટેગરી પ્રમાણે રાજકોટની ઓફર્સ શોધો.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const featured = categories.find((c) => c.featured);
  const grid = categories.filter((c) => !c.featured);

  return (
    <Container className="flex flex-col gap-8 pt-6 pb-10 lg:gap-14 lg:pt-12 lg:pb-20">
      <PageTitle title="કેટેગરી" subtitle="તમને શું જોઈએ છે? કેટેગરી પસંદ કરો" />

      {featured && (
        <CategoryBanner
          eyebrow="આ સીઝન"
          title={featured.name}
          description={featured.description}
          image={featured.image}
          href={categoryHref(featured.slug)}
          cta={`${featured.offerCount} ઓફર્સ`}
        />
      )}

      <CategoryImageGrid categories={grid} />

      <section id="areas" className="scroll-mt-20">
        <h2 className="mb-4 text-xl font-semibold lg:mb-6 lg:text-[28px]">વિસ્તાર પ્રમાણે શોધો</h2>
        <AreaPills areas={getAreas()} />
      </section>
    </Container>
  );
}

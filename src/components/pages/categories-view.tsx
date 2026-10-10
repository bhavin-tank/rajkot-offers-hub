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
import { getT } from "@/lib/i18n/server";
import { resolveArea } from "./resolve-area";

export async function categoriesMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Category"),
    description: t("Find Rajkot's offers by category: food, fashion, beauty and more."),
  };
}

/** The category list for all of Rajkot, or with one area's counts when `area` comes from the URL. */
export async function CategoriesView({ area: areaSlug }: { area?: string }) {
  const t = await getT();
  const area = await resolveArea(areaSlug);
  const categories = await getCategories(area?.slug);
  const featured = categories.find((c) => c.featured);
  const grid = categories.filter((c) => !c.featured);

  return (
    <Container className="flex flex-col gap-8 pt-6 pb-10 lg:gap-14 lg:pt-12 lg:pb-20">
      <PageTitle title={t("Category")} subtitle={t("What are you looking for? Pick a category")} />

      {featured && (
        <CategoryBanner
          eyebrow={t("This season")}
          title={featured.name}
          description={featured.description}
          image={featured.image}
          href={categoryHref(featured.slug)}
          cta={formatOfferCount(featured.offerCount, t)}
        />
      )}

      <CategoryImageGrid categories={grid} />

      <section id="areas" className="scroll-mt-20">
        <h2 className="mb-4 text-xl font-semibold lg:mb-6 lg:text-[28px]">{t("Browse by area")}</h2>
        <AreaPills areas={await getAreas()} />
      </section>
    </Container>
  );
}

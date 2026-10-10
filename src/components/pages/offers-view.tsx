import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container, PageTitle } from "@/components/layout/container";
import { SearchBar } from "@/components/marketing/search-bar";
import { OffersExplorer } from "@/components/offers/offers-explorer";
import { OffersSkeleton } from "@/components/offers/offers-skeleton";
import { getArea, getCategories, getCategory, getOffers } from "@/lib/data";
import { offersPath } from "@/lib/areas";
import { filtersToQuery, parseFilters } from "@/lib/filters";
import { getT } from "@/lib/i18n/server";
import type { Area, Category } from "@/types";
import { resolveArea } from "./resolve-area";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function offersMetadata(areaSlug?: string, categorySlug?: string): Promise<Metadata> {
  const t = await getT();
  const [area, category] = await Promise.all([
    areaSlug ? getArea(areaSlug) : undefined,
    categorySlug ? getCategory(categorySlug) : undefined,
  ]);
  if ((areaSlug && !area) || (categorySlug && !category)) return {};

  if (category) {
    return {
      title: area ? `${category.name} · ${area.name}` : category.name,
      description: category.description,
    };
  }
  return area
    ? {
        title: t("Offers in {area}", { area: area.name }),
        description: t("All live offers in {area}: search by category and offer type.", { area: area.name }),
      }
    : {
        title: t("All offers"),
        description: t("All live offers in Rajkot: search by area, category and offer type."),
      };
}

/**
 * The offers list for all of Rajkot or one area, optionally narrowed to one
 * category. Area and category both come from the URL path.
 */
export async function OffersView({
  area: areaSlug,
  category: categorySlug,
  searchParams,
}: {
  area?: string;
  category?: string;
  searchParams: SearchParams;
}) {
  const area = await resolveArea(areaSlug);
  const category = categorySlug ? await getCategory(categorySlug) : undefined;
  if (categorySlug && !category) notFound();

  return (
    <Container className="pt-6 pb-10 lg:pt-12 lg:pb-20">
      <Suspense fallback={<OffersSkeleton />}>
        <OffersContent area={area} category={category} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function OffersContent({
  area,
  category,
  searchParams,
}: {
  area?: Area;
  category?: Category;
  searchParams: SearchParams;
}) {
  const t = await getT();
  // The area and category live in the path, so they are not part of the query filters.
  const filters = { ...parseFilters(await searchParams), areas: area ? [area.slug] : undefined };
  const [result, categories, liveCount] = await Promise.all([
    getOffers({ ...filters, category: category?.slug }),
    getCategories(area?.slug),
    getOffers({ areas: filters.areas, category: category?.slug }).then((r) => r.total),
  ]);

  // Switching category keeps the search, type, validity and sort, but not the sub-category.
  const chipQuery = filtersToQuery({ ...filters, subcategory: undefined });
  const chips = [
    { label: t("All"), href: `${offersPath(area?.slug)}${chipQuery}`, selected: !category },
    ...categories.map((c) => ({
      label: c.shortName,
      href: `${offersPath(area?.slug, c.slug)}${chipQuery}`,
      selected: category?.slug === c.slug,
    })),
  ];

  const basePath = offersPath(area?.slug, category?.slug);
  const subtitle = area
    ? t(liveCount === 1 ? "{count} live offer in {area}" : "{count} live offers in {area}", { count: liveCount, area: area.name })
    : t(liveCount === 1 ? "{count} live offer in Rajkot" : "{count} live offers in Rajkot", { count: liveCount });

  return (
    <>
      <div className="mb-5 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
        <PageTitle title={category?.name ?? t("All offers")} subtitle={subtitle} />
        <SearchBar variant="pageLarge" defaultValue={filters.q} action={basePath} className="hidden w-[480px] lg:flex" />
      </div>
      <OffersExplorer basePath={basePath} filters={filters} result={result} chips={chips} layout="sidebar" />
    </>
  );
}

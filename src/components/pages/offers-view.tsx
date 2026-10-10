import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageTitle } from "@/components/layout/container";
import { SearchBar } from "@/components/marketing/search-bar";
import { OffersExplorer } from "@/components/offers/offers-explorer";
import { OffersSkeleton } from "@/components/offers/offers-skeleton";
import { getArea, getCategories, getOffers } from "@/lib/data";
import { parseFilters } from "@/lib/filters";
import { getT } from "@/lib/i18n/server";
import type { Area } from "@/types";
import { resolveArea } from "./resolve-area";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function offersMetadata(areaSlug?: string): Promise<Metadata> {
  const t = await getT();
  const area = areaSlug ? await getArea(areaSlug) : undefined;
  if (areaSlug && !area) return {};
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

/** The offers list for all of Rajkot, or for one area when `area` comes from the URL. */
export async function OffersView({ area: areaSlug, searchParams }: { area?: string; searchParams: SearchParams }) {
  const area = await resolveArea(areaSlug);
  return (
    <Container className="pt-6 pb-10 lg:pt-12 lg:pb-20">
      <Suspense fallback={<OffersSkeleton />}>
        <OffersContent area={area} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function OffersContent({ area, searchParams }: { area?: Area; searchParams: SearchParams }) {
  const t = await getT();
  const filters = { ...parseFilters(await searchParams), areas: area ? [area.slug] : undefined };
  const [result, categories, liveCount] = await Promise.all([
    getOffers(filters),
    getCategories(area?.slug),
    getOffers({ areas: filters.areas }).then((r) => r.total),
  ]);

  const chips = [
    { label: t("All"), patch: { category: undefined }, selected: !filters.category },
    ...categories.map((c) => ({
      label: c.shortName,
      patch: { category: c.slug },
      selected: filters.category === c.slug,
    })),
  ];

  const subtitle = area
    ? t(liveCount === 1 ? "{count} live offer in {area}" : "{count} live offers in {area}", { count: liveCount, area: area.name })
    : t(liveCount === 1 ? "{count} live offer in Rajkot" : "{count} live offers in Rajkot", { count: liveCount });

  return (
    <>
      <div className="mb-5 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
        <PageTitle title={t("All offers")} subtitle={subtitle} />
        <SearchBar
          variant="pageLarge"
          defaultValue={filters.q}
          className="hidden w-[480px] lg:flex"
          hidden={filters.category && <input type="hidden" name="category" value={filters.category} />}
        />
      </div>
      <OffersExplorer basePath="/offers" filters={filters} result={result} chips={chips} layout="sidebar" />
    </>
  );
}

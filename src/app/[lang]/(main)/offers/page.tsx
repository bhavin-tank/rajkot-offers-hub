import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageTitle } from "@/components/layout/container";
import { SearchBar } from "@/components/marketing/search-bar";
import { OffersExplorer } from "@/components/offers/offers-explorer";
import { OffersSkeleton } from "@/components/offers/offers-skeleton";
import { getCategories, getFilterAreas, getOffers } from "@/lib/data";
import { parseFilters } from "@/lib/filters";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("All offers"),
    description: t("All live offers in Rajkot: search by area, category and offer type."),
  };
}

export default function OffersPage({ searchParams }: PageProps<"/[lang]/offers">) {
  return (
    <Container className="pt-6 pb-10 lg:pt-12 lg:pb-20">
      <Suspense fallback={<OffersSkeleton />}>
        <OffersContent searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function OffersContent({ searchParams }: Pick<PageProps<"/[lang]/offers">, "searchParams">) {
  const t = await getT();
  const filters = parseFilters(await searchParams);
  const [result, categories, liveCount] = await Promise.all([
    getOffers(filters),
    getCategories(),
    getOffers().then((r) => r.total),
  ]);

  const chips = [
    { label: t("All"), patch: { category: undefined }, selected: !filters.category },
    ...categories.map((c) => ({
      label: c.shortName,
      patch: { category: c.slug },
      selected: filters.category === c.slug,
    })),
  ];

  return (
    <>
      <div className="mb-5 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
        <PageTitle title={t("All offers")}
          subtitle={liveCount === 1 ? t("{count} live offer in Rajkot", { count: liveCount }) : t("{count} live offers in Rajkot", { count: liveCount })} />
        <SearchBar
          variant="pageLarge"
          defaultValue={filters.q}
          className="hidden w-[480px] lg:flex"
          hidden={filters.category && <input type="hidden" name="category" value={filters.category} />}
        />
      </div>
      <OffersExplorer
        basePath="/offers"
        filters={filters}
        result={result}
        areas={await getFilterAreas()}
        chips={chips}
        layout="sidebar"
      />
    </>
  );
}

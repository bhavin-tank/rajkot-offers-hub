import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageTitle } from "@/components/layout/container";
import { SearchBar } from "@/components/marketing/search-bar";
import { OffersExplorer } from "@/components/offers/offers-explorer";
import { OffersSkeleton } from "@/components/offers/offers-skeleton";
import { getCategories, getFilterAreas, getOffers } from "@/lib/data";
import { parseFilters } from "@/lib/filters";

export const metadata: Metadata = {
  title: "All offers",
  description: "All live offers in Rajkot: search by area, category and offer type.",
};

export default function OffersPage({ searchParams }: PageProps<"/offers">) {
  return (
    <Container className="pt-6 pb-10 lg:pt-12 lg:pb-20">
      <Suspense fallback={<OffersSkeleton />}>
        <OffersContent searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function OffersContent({ searchParams }: Pick<PageProps<"/offers">, "searchParams">) {
  const filters = parseFilters(await searchParams);
  const [result, categories, liveCount] = await Promise.all([
    getOffers(filters),
    getCategories(),
    getOffers().then((r) => r.total),
  ]);

  const chips = [
    { label: "All", patch: { category: undefined }, selected: !filters.category },
    ...categories.map((c) => ({
      label: c.shortName,
      patch: { category: c.slug },
      selected: filters.category === c.slug,
    })),
  ];

  return (
    <>
      <div className="mb-5 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
        <PageTitle title="All offers" subtitle={`${liveCount} live ${liveCount === 1 ? "offer" : "offers"} in Rajkot`} />
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
        areas={getFilterAreas()}
        chips={chips}
        layout="sidebar"
      />
    </>
  );
}

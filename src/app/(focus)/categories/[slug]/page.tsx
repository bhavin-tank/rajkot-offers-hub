import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { Suspense } from "react";
import { CategoryBanner } from "@/components/categories/category-tiles";
import { Breadcrumb, Container } from "@/components/layout/container";
import { MobileTopBar } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/nav-links";
import { OffersExplorer } from "@/components/offers/offers-explorer";
import { OffersSkeleton } from "@/components/offers/offers-skeleton";
import { IconLink } from "@/components/ui/icon-button";
import { getCategory, getCategorySlugs, getFilterAreas, getOffers } from "@/lib/data";
import { parseFilters } from "@/lib/filters";

export function generateStaticParams() {
  return getCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  return category ? { title: category.name, description: category.description } : {};
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/categories/[slug]">) {
  const category = await getCategory((await params).slug);
  if (!category) notFound();

  return (
    <>
      <MobileTopBar
        title={category.name}
        backHref="/categories"
        action={
          <IconLink href="/offers" variant="plain" size="lg" aria-label="શોધો">
            <Search size={20} aria-hidden />
          </IconLink>
        }
      />
      <Container className="flex flex-col gap-5 pt-4 pb-24 lg:gap-8 lg:pt-8 lg:pb-20">
        <Breadcrumb
          items={[{ href: "/", label: "હોમ" }, { href: "/categories", label: "કેટેગરી" }, { label: category.name }]}
        />
        <CategoryBanner variant="hero" title={category.name} description={category.description} image={category.image} />
        <Suspense fallback={<OffersSkeleton />}>
          <CategoryOffers slug={category.slug} subcategories={category.subcategories} searchParams={searchParams} />
        </Suspense>
      </Container>
      <BottomNav />
    </>
  );
}

async function CategoryOffers({
  slug,
  subcategories,
  searchParams,
}: {
  slug: string;
  subcategories: string[];
  searchParams: PageProps<"/categories/[slug]">["searchParams"];
}) {
  // The category comes from the path, never from the query.
  const filters = { ...parseFilters(await searchParams), category: undefined };
  const result = await getOffers({ ...filters, category: slug });

  const chips = subcategories.length
    ? [
        { label: "બધી", patch: { subcategory: undefined }, selected: !filters.subcategory },
        ...subcategories.map((sub) => ({ label: sub, patch: { subcategory: sub }, selected: filters.subcategory === sub })),
      ]
    : [];

  return (
    <OffersExplorer
      basePath={`/categories/${slug}`}
      filters={filters}
      result={result}
      areas={getFilterAreas()}
      chips={chips}
      layout="inline"
      emptyTitle="આ કેટેગરીમાં હાલ કોઈ ઓફર નથી"
      emptyHint="નવી ઓફર આવે ત્યારે અહીં દેખાશે."
      emptyAction={{ href: "/categories", label: "બીજી કેટેગરી જુઓ" }}
    />
  );
}

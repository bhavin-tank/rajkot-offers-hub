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
import { localizeContent } from "@/lib/i18n/content-server";
import { getLocale, getT } from "@/lib/i18n/server";

export function generateStaticParams() {
  return getCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/categories/[slug]">): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  return category ? { title: category.name, description: category.description } : {};
}

async function CategoryContent({ params, searchParams }: PageProps<"/[lang]/categories/[slug]">) {
  const t = await getT();
  const category = await getCategory((await params).slug);
  if (!category) notFound();

  return (
    <>
      <MobileTopBar
        title={category.name}
        backHref="/categories"
        action={
          <IconLink href="/offers" variant="plain" size="lg" aria-label={t("Search")}>
            <Search size={20} aria-hidden />
          </IconLink>
        }
      />
      <Container className="flex flex-col gap-5 pt-4 pb-24 lg:gap-8 lg:pt-8 lg:pb-20">
        <Breadcrumb
          items={[{ href: "/", label: t("Home") }, { href: "/categories", label: t("Categories") }, { label: category.name }]}
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
  searchParams: PageProps<"/[lang]/categories/[slug]">["searchParams"];
}) {
  const t = await getT();
  const locale = await getLocale();
  // The category comes from the path, never from the query.
  const filters = { ...parseFilters(await searchParams), category: undefined };
  const result = await getOffers({ ...filters, category: slug });

  const chips = subcategories.length
    ? [
        { label: t("All"), patch: { subcategory: undefined }, selected: !filters.subcategory },
        ...subcategories.map((sub) => ({ label: localizeContent(locale, sub), patch: { subcategory: sub }, selected: filters.subcategory === sub })),
      ]
    : [];

  return (
    <OffersExplorer
      basePath={`/categories/${slug}`}
      filters={filters}
      result={result}
      areas={await getFilterAreas()}
      chips={chips}
      layout="inline"
      emptyTitle={t("No offers in this category right now")}
      emptyHint={t("New offers will appear here.")}
      emptyAction={{ href: "/categories", label: t("Browse other categories") }}
    />
  );
}

export default function CategoryPage(props: PageProps<"/[lang]/categories/[slug]">) {
  return (
    <Suspense
      fallback={
        <Container className="pt-6 pb-24 lg:pt-12">
          <OffersSkeleton />
        </Container>
      }
    >
      <CategoryContent {...props} />
    </Suspense>
  );
}

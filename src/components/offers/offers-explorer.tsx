import { Link } from "@/components/i18n/link";
import { SearchX } from "lucide-react";
import type { Area, OfferFilters, OfferSummary, Paged, SortKey } from "@/types";
import { SearchBar } from "@/components/marketing/search-bar";
import { ButtonLink } from "@/components/ui/button";
import { ChipLink, RemovableChip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/display";
import {
  OFFER_TYPES,
  SORT_OPTIONS,
  VALIDITY_OPTIONS,
  countPanelFilters,
  filtersToQuery,
} from "@/lib/filters";
import { formatOfferCount } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import { FilterForm } from "./filter-form";
import { FilterSheet } from "./filter-sheet";
import { OfferGrid } from "./offer-card";
import { SortMenu } from "./sort-menu";

export interface ChipOption {
  label: string;
  /** The filter patch this chip applies. */
  patch: Partial<OfferFilters>;
  selected: boolean;
}

interface OffersExplorerProps {
  /** "/offers" or "/categories/<slug>". */
  basePath: string;
  filters: OfferFilters;
  result: Paged<OfferSummary>;
  areas: Area[];
  chips: ChipOption[];
  /** "sidebar": /offers layout. "inline": category page layout. */
  layout: "sidebar" | "inline";
  emptyTitle?: string;
  emptyHint?: string;
  emptyAction?: { href: string; label: string };
}

/** Search, chips, filters, sort, results and "load more" for an offer list. */
export async function OffersExplorer({
  basePath,
  filters,
  result,
  areas,
  chips,
  layout,
  emptyTitle,
  emptyHint,
  emptyAction,
}: OffersExplorerProps) {
  const t = await getT();
  const href = (patch: Partial<OfferFilters> = {}) => `${basePath}${filtersToQuery(filters, patch)}`;
  const keepCategory = layout === "sidebar";
  const panelCount = countPanelFilters(filters);
  const sortHrefs = Object.fromEntries(
    SORT_OPTIONS.map((o) => [o.value, href({ sort: o.value })]),
  ) as Record<SortKey, string>;

  const filterForm = (variant: "sidebar" | "sheet") => (
    <FilterForm
      action={basePath}
      filters={filters}
      areas={areas}
      keepCategory={keepCategory}
      variant={variant}
      idPrefix={variant}
    />
  );

  const active = [
    ...(filters.areas ?? []).map((slug) => ({
      key: `area-${slug}`,
      label: areas.find((a) => a.slug === slug)?.name ?? slug,
      href: href({ areas: filters.areas!.filter((a) => a !== slug) }),
    })),
    ...(filters.type
      ? [{ key: "type", label: t(OFFER_TYPES.find((o) => o.value === filters.type)!.label), href: href({ type: undefined }) }]
      : []),
    ...(filters.validity
      ? [
          {
            key: "validity",
            label: t(VALIDITY_OPTIONS.find((v) => v.value === filters.validity)!.label),
            href: href({ validity: undefined }),
          },
        ]
      : []),
    ...(filters.q ? [{ key: "q", label: `“${filters.q}”`, href: href({ q: undefined }) }] : []),
  ];

  const chipRow = (
    <div
      className={cn(
        "no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5",
        "lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0",
      )}
    >
      {chips.map((chip) => (
        <ChipLink key={chip.label} href={href(chip.patch)} scroll={false} selected={chip.selected} className="lg:h-[38px] lg:px-[18px] lg:text-sm">
          {chip.label}
        </ChipLink>
      ))}
    </div>
  );

  const countLabel = <p className="text-sm font-medium lg:text-[15px]">{formatOfferCount(result.total, t)}</p>;

  const results = (
    <>
      {active.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {active.map((item) => (
            <RemovableChip key={item.key} href={item.href} scroll={false}>
              {item.label}
            </RemovableChip>
          ))}
          <ButtonLink href={basePath} scroll={false} variant="ghost" size="sm" className="h-[34px] px-2 text-[13px]">
            {t("Clear all")}
          </ButtonLink>
        </div>
      )}
      {result.items.length ? (
        <>
          <OfferGrid offers={result.items} />
          {result.hasMore && (
            <div className="mt-6 flex justify-center lg:mt-10">
              <ButtonLink
                href={href({ page: result.page + 1 })}
                scroll={false}
                variant="outline"
                className="w-full lg:w-auto lg:px-7"
              >
                {t("Show more offers")}
              </ButtonLink>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={SearchX}
          title={emptyTitle ?? t("No offers found")}
          hint={emptyHint ?? t("Change the filters and try again")}
          action={
            <ButtonLink
              href={emptyAction?.href ?? basePath}
              variant="outline"
              className="h-11"
            >
              {emptyAction?.label ?? t("Reset filters")}
            </ButtonLink>
          }
        />
      )}
    </>
  );

  if (layout === "inline") {
    return (
      <div className="flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {chipRow}
          <div className="flex items-center gap-2">
            <div className="mr-auto lg:mr-2">{countLabel}</div>
            <SortMenu key={filters.sort} value={filters.sort ?? "newest"} hrefs={sortHrefs} />
            <FilterSheet count={panelCount} trigger="round" className="lg:hidden">
              {filterForm("sheet")}
            </FilterSheet>
            <FilterSheet count={panelCount} trigger="pill" className="hidden lg:inline-flex">
              {filterForm("sheet")}
            </FilterSheet>
          </div>
        </div>
        <div>{results}</div>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:items-start lg:gap-12">
      <aside className="sticky top-6 hidden rounded-2xl border border-line p-6 lg:block">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("Filter")}</h2>
          <Link href={basePath} scroll={false} className="text-[13px] font-medium text-muted hover:text-ink">
            {t("Reset all")}
          </Link>
        </div>
        {filterForm("sidebar")}
      </aside>

      <div className="flex flex-col gap-4 lg:gap-6">
        {/* Mobile: sticky search and chips. */}
        <div className="sticky top-14 z-20 -mx-5 flex flex-col gap-3 border-b border-line bg-white px-5 pt-1 pb-3 lg:static lg:mx-0 lg:border-0 lg:p-0">
          <div className="flex gap-2 lg:hidden">
            <SearchBar
              defaultValue={filters.q}
              className="flex-1"
              hidden={filters.category && <input type="hidden" name="category" value={filters.category} />}
            />
            <FilterSheet count={panelCount}>{filterForm("sheet")}</FilterSheet>
          </div>
          {chipRow}
        </div>
        <div className="flex items-center justify-between">
          {countLabel}
          <SortMenu key={filters.sort} value={filters.sort ?? "newest"} hrefs={sortHrefs} />
        </div>
        <div>{results}</div>
      </div>
    </div>
  );
}

import { api, orUndefined } from "@/lib/api/client";
import { toArea, toCategory } from "@/lib/api/mappers";
import type { AreaCount, CategoryChip, Page, PromotionCard } from "@/lib/api/types";
import type { Area, AreaWithCount, CategoryWithCount } from "@/types";
import { cacheFor, TAGS } from "./cache";

/** Every area with live offers, busiest first. */
async function areaCounts(): Promise<AreaCount[]> {
  "use cache";
  cacheFor(TAGS.offers, TAGS.catalog);
  return (await api<{ data: AreaCount[] }>("/promotions/areas")).data;
}

/** The main categories with live offer counts, for all of Rajkot or within one area (by name). */
async function categoryChips(areaName?: string, parent?: string): Promise<CategoryChip[]> {
  "use cache";
  cacheFor(TAGS.offers, TAGS.catalog);
  return (await api<{ data: CategoryChip[] }>("/promotions/categories", { query: { parent, areas: areaName ? [areaName] : undefined } })).data;
}

/** An area's display name from its slug; undefined for an area with no live offers. */
export async function areaName(slug: string) {
  return (await areaCounts()).find((a) => a.slug === slug)?.name;
}

export async function getCategories(areaSlug?: string): Promise<CategoryWithCount[]> {
  const name = areaSlug ? await areaName(areaSlug) : undefined;
  if (areaSlug && !name) return (await categoryChips()).map((chip) => toCategory({ ...chip, promotions_count: 0 }));
  return (await categoryChips(name)).map((chip) => toCategory(chip));
}

/** The category's ancestor at the top of the offer categories, for a deeper slug (a business's own category). */
async function topCategorySlug(slug: string): Promise<string | undefined> {
  "use cache";
  cacheFor(TAGS.catalog);
  const detail = await orUndefined(api<{ data: { breadcrumbs?: { slug: string; depth: number }[] } }>(`/categories/${encodeURIComponent(slug)}`));
  return detail?.data.breadcrumbs?.find((crumb) => crumb.depth === 1)?.slug;
}

/** A main category with its subcategories; a deeper slug resolves to its main category. */
export async function getCategory(slug: string): Promise<CategoryWithCount | undefined> {
  if (!slug) return undefined;
  const chips = await categoryChips();
  let chip = chips.find((c) => c.slug === slug);
  if (!chip) {
    const parent = await topCategorySlug(slug);
    chip = chips.find((c) => c.slug === parent);
  }
  if (!chip) return undefined;
  const children = await categoryChips(undefined, chip.slug);
  return toCategory(
    chip,
    children.filter((c) => c.promotions_count > 0).map((c) => ({ slug: c.slug, name: c.name })),
  );
}

export async function getCategorySlugs() {
  return (await categoryChips()).map((c) => c.slug);
}

export async function isCategorySlug(slug: string) {
  return (await getCategorySlugs()).includes(slug);
}

export async function getAreas(): Promise<Area[]> {
  return (await areaCounts()).map((a) => ({ slug: a.slug, name: a.name }));
}

export async function getArea(slug: string): Promise<Area | undefined> {
  return (await getAreas()).find((a) => a.slug === slug);
}

export async function getAreaSlugs() {
  return (await areaCounts()).map((a) => a.slug);
}

async function liveTotal() {
  "use cache";
  cacheFor(TAGS.offers);
  return (await api<Page<PromotionCard>>("/promotions", { query: { per_page: 1 } })).meta.total;
}

/** Every area with its live offer count (most offers first), plus the total for all of Rajkot. */
export async function getAreasWithCounts(): Promise<{ total: number; areas: AreaWithCount[] }> {
  const [areas, total] = await Promise.all([areaCounts(), liveTotal()]);
  return { total, areas: areas.map(toArea) };
}

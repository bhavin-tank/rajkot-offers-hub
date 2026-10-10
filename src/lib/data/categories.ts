import type { Locale } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { findAreas, findAreasWithCounts, findCategoriesWithCounts } from "@/server/services/catalog";
import type { Area, AreaWithCount, CategoryWithCount } from "@/types";
import { cacheFor, getSlugs, TAGS, today } from "./cache";

/** Categories with their live offer counts, for all of Rajkot or for one area. */
export async function categoriesFor(locale: Locale, areaSlug?: string): Promise<CategoryWithCount[]> {
  "use cache";
  cacheFor(TAGS.catalog, TAGS.offers);
  return findCategoriesWithCounts(locale, today(), areaSlug);
}

export async function areasFor(locale: Locale): Promise<Area[]> {
  "use cache";
  cacheFor(TAGS.catalog);
  return findAreas(locale);
}

/** Every area with its live offer count (most offers first), plus the total for all of Rajkot. */
export async function areasWithCountsFor(locale: Locale): Promise<{ total: number; areas: AreaWithCount[] }> {
  "use cache";
  cacheFor(TAGS.catalog, TAGS.offers);
  return findAreasWithCounts(locale, today());
}

export async function getCategories(areaSlug?: string): Promise<CategoryWithCount[]> {
  return categoriesFor(await getLocale(), areaSlug);
}

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function getCategorySlugs() {
  return (await getSlugs()).categories;
}

export async function isCategorySlug(slug: string) {
  return (await getCategorySlugs()).includes(slug);
}

export async function getAreas(): Promise<Area[]> {
  return areasFor(await getLocale());
}

export async function getArea(slug: string): Promise<Area | undefined> {
  return (await getAreas()).find((a) => a.slug === slug);
}

export async function getAreaSlugs() {
  return (await getSlugs()).areas;
}

export async function getAreasWithCounts() {
  return areasWithCountsFor(await getLocale());
}

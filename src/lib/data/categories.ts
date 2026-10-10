import type { Area, AreaWithCount, CategoryWithCount } from "@/types";
import { getLocale } from "@/lib/i18n/server";
import { areas, categories, localizedAreas, localizedCategories } from "./catalog";
import { getAllOffers } from "./offers";

/** Categories with their live offer counts, for all of Rajkot or for one area. */
export async function getCategories(areaSlug?: string): Promise<CategoryWithCount[]> {
  const live = (await getAllOffers()).filter((o) => !o.isExpired && (!areaSlug || o.areaSlug === areaSlug));
  return localizedCategories(await getLocale()).map((c) => ({
    ...c,
    offerCount: live.filter((o) => o.categorySlug === c.slug).length,
  }));
}

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug);
}

export function getCategorySlugs() {
  return categories.map((c) => c.slug);
}

export async function getAreas(): Promise<Area[]> {
  return localizedAreas(await getLocale());
}

export async function getArea(slug: string): Promise<Area | undefined> {
  return (await getAreas()).find((a) => a.slug === slug);
}

export function getAreaSlugs() {
  return areas.map((a) => a.slug);
}

/** Every area with its live offer count (most offers first), plus the total for all of Rajkot. */
export async function getAreasWithCounts(): Promise<{ total: number; areas: AreaWithCount[] }> {
  const live = (await getAllOffers()).filter((o) => !o.isExpired);
  const areas = (await getAreas())
    .map((a) => ({ ...a, offerCount: live.filter((o) => o.areaSlug === a.slug).length }))
    // Array.sort is stable, so areas with equal counts keep their catalog order.
    .sort((a, b) => b.offerCount - a.offerCount);
  return { total: live.length, areas };
}

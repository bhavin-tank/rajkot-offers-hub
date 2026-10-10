import type { Area, AreaWithCount, CategoryWithCount } from "@/types";
import { getLocale } from "@/lib/i18n/server";
import { FILTER_AREA_COUNT } from "@/lib/mock/areas";
import { categories, localizedAreas, localizedCategories } from "./catalog";
import { getAllOffers } from "./offers";

export async function getCategories(): Promise<CategoryWithCount[]> {
  const live = (await getAllOffers()).filter((o) => !o.isExpired);
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

export async function getFilterAreas(): Promise<Area[]> {
  return (await getAreas()).slice(0, FILTER_AREA_COUNT);
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

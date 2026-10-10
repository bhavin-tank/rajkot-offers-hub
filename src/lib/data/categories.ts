import type { Area, CategoryWithCount } from "@/types";
import { FILTER_AREA_COUNT } from "@/lib/mock/areas";
import { areas, categories } from "./catalog";
import { getAllOffers } from "./offers";

export async function getCategories(): Promise<CategoryWithCount[]> {
  const live = (await getAllOffers()).filter((o) => !o.isExpired);
  return categories.map((c) => ({
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

export function getAreas(): Area[] {
  return areas;
}

export function getFilterAreas(): Area[] {
  return areas.slice(0, FILTER_AREA_COUNT);
}

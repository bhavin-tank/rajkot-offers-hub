import type { Locale } from "@/lib/i18n/config";
import type { Area, AreaWithCount, Category, CategoryWithCount } from "@/types";
import { collections, type AreaDoc, type CategoryDoc } from "../db/models";
import { pick } from "../lib/i18n";
import { liveOfferFilter } from "./visibility";

export function toArea(doc: AreaDoc, locale: Locale): Area {
  return { slug: doc.slug, name: pick(doc.name, locale) };
}

/**
 * `subcategories` stay English on purpose: they are filter values in the URL,
 * so a visitor can switch language without losing the filter.
 */
export function toCategory(doc: CategoryDoc, locale: Locale): Category {
  return {
    slug: doc.slug,
    name: pick(doc.name, locale),
    shortName: pick(doc.shortName, locale),
    icon: doc.icon,
    image: doc.image,
    description: pick(doc.description, locale),
    subcategories: doc.subcategories.map((s) => s.value),
    inHomeRow: doc.inHomeRow,
    ...(doc.featured && { featured: true }),
  };
}

export async function findAreaDocs() {
  const { areas } = await collections();
  return areas.find({ isActive: true }).sort({ sortOrder: 1 }).toArray();
}

export async function findCategoryDocs() {
  const { categories } = await collections();
  return categories.find({ isActive: true }).sort({ sortOrder: 1 }).toArray();
}

export async function findAreas(locale: Locale): Promise<Area[]> {
  return (await findAreaDocs()).map((doc) => toArea(doc, locale));
}

/** Live offers per value of `field`, optionally only in one area. */
async function countLiveOffers(field: "areaSlug" | "categorySlug", today: string, areaSlug?: string) {
  const { offers } = await collections();
  const rows = await offers
    .aggregate<{ _id: string; count: number }>([
      { $match: { ...liveOfferFilter(today), ...(areaSlug && { areaSlug }) } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    ])
    .toArray();
  return new Map(rows.map((r) => [r._id, r.count]));
}

/** Every category with its live offer count, for all of Rajkot or for one area. */
export async function findCategoriesWithCounts(locale: Locale, today: string, areaSlug?: string): Promise<CategoryWithCount[]> {
  const [docs, counts] = await Promise.all([findCategoryDocs(), countLiveOffers("categorySlug", today, areaSlug)]);
  return docs.map((doc) => ({ ...toCategory(doc, locale), offerCount: counts.get(doc.slug) ?? 0 }));
}

/** Every area with its live offer count (most offers first), plus the total for all of Rajkot. */
export async function findAreasWithCounts(locale: Locale, today: string): Promise<{ total: number; areas: AreaWithCount[] }> {
  const { offers } = await collections();
  const [docs, counts, total] = await Promise.all([
    findAreaDocs(),
    countLiveOffers("areaSlug", today),
    offers.countDocuments(liveOfferFilter(today)),
  ]);
  const areas = docs
    .map((doc) => ({ ...toArea(doc, locale), offerCount: counts.get(doc.slug) ?? 0 }))
    // Array.sort is stable, so areas with equal counts keep their catalog order.
    .sort((a, b) => b.offerCount - a.offerCount);
  return { total, areas };
}

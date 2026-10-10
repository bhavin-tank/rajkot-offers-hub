import type { Locale } from "@/lib/i18n/config";
import type { Business } from "@/types";
import { collections, type AreaDoc, type BusinessDoc, type CategoryDoc } from "../db/models";
import { formatAddress, pick } from "../lib/i18n";
import { findAreaDocs, findCategoryDocs } from "./catalog";

export function toBusiness(doc: BusinessDoc, category: CategoryDoc | null, area: AreaDoc | null, locale: Locale): Business {
  return {
    slug: doc.slug,
    name: doc.name,
    categorySlug: doc.categorySlug,
    categoryName: category ? pick(category.shortName, locale) : "",
    areaSlug: doc.areaSlug,
    areaName: area ? pick(area.name, locale) : "",
    cover: doc.cover,
    about: pick(doc.about, locale),
    address: formatAddress(doc.addressLine, doc.postalCode, locale),
    streetAddress: doc.addressLine,
    postalCode: doc.postalCode,
    phone: doc.phone,
    whatsapp: doc.whatsapp,
    ...(doc.instagram && { instagram: doc.instagram }),
    ...(doc.website && { website: doc.website }),
    hours: doc.hours,
    photos: doc.photos,
    geo: { lat: doc.geo.coordinates[1], lng: doc.geo.coordinates[0] },
  };
}

/** An active business by slug; undefined when unknown or not public. */
export async function findBusiness(slug: string, locale: Locale): Promise<Business | undefined> {
  const db = await collections();
  const doc = await db.businesses.findOne({ slug, status: "active" });
  if (!doc) return undefined;
  const [category, area] = await Promise.all([
    db.categories.findOne({ slug: doc.categorySlug }),
    db.areas.findOne({ slug: doc.areaSlug }),
  ]);
  return toBusiness(doc, category, area, locale);
}

/** Every active business, for the sitemap. */
export async function findBusinesses(locale: Locale): Promise<Business[]> {
  const { businesses } = await collections();
  const [docs, categories, areas] = await Promise.all([
    businesses.find({ status: "active" }).sort({ sortOrder: 1 }).toArray(),
    findCategoryDocs(),
    findAreaDocs(),
  ]);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const areaBySlug = new Map(areas.map((a) => [a.slug, a]));
  return docs.map((doc) =>
    toBusiness(doc, categoryBySlug.get(doc.categorySlug) ?? null, areaBySlug.get(doc.areaSlug) ?? null, locale),
  );
}

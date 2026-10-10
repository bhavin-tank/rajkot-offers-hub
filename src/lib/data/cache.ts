import { cacheLife, cacheTag } from "next/cache";
import { toIsoDay } from "@/lib/format";
import { findSlugs } from "@/server/services/slugs";

/**
 * Cache tags. Writes (admin approvals, owner edits) revalidate the tags they
 * touch: an offer change → "offers", a category or area change → "catalog",
 * a business profile change → "businesses". "slugs" covers all three.
 */
export const TAGS = { offers: "offers", catalog: "catalog", businesses: "businesses", slugs: "slugs" } as const;

/** Marks the enclosing "use cache" function as hourly data with these tags. */
export function cacheFor(...tags: (typeof TAGS)[keyof typeof TAGS][]) {
  cacheLife("hours");
  cacheTag(...tags);
}

/** Today in Rajkot; offers start and end on Rajkot calendar days. */
export function today() {
  return toIsoDay(new Date());
}

/** Every public slug: areas, categories, offers and businesses. */
export async function getSlugs() {
  "use cache";
  cacheFor(TAGS.slugs, TAGS.offers, TAGS.catalog, TAGS.businesses);
  return findSlugs();
}

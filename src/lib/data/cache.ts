import { cacheLife, cacheTag, revalidateTag, updateTag } from "next/cache";
import { forgetKnownSlugs } from "@/lib/known-paths";
import { toIsoDay } from "@/lib/format";
import { findSlugs } from "@/server/services/slugs";

/**
 * Cache tags. Writes (admin approvals, owner edits) revalidate the tags they
 * touch: an offer change → "offers", a category or area change → "catalog",
 * a business profile change → "businesses". "slugs" covers all three.
 */
export const TAGS = { offers: "offers", catalog: "catalog", businesses: "businesses", slugs: "slugs" } as const;

export type Tag = (typeof TAGS)[keyof typeof TAGS];

/**
 * After a write: expire the tags it touched. Server actions see their own
 * change on the next render (`updateTag`); route handlers expire the entries so
 * the next request reads fresh data.
 */
export function refreshTags(tags: Tag[], from: "action" | "route") {
  for (const tag of new Set(tags)) {
    if (from === "action") updateTag(tag);
    else revalidateTag(tag, { expire: 0 });
  }
  if (tags.includes(TAGS.slugs)) forgetKnownSlugs();
}

/** What each kind of write changes on the public site. */
export const WRITE_TAGS = {
  offer: [TAGS.offers, TAGS.slugs],
  business: [TAGS.businesses, TAGS.offers, TAGS.slugs],
  catalog: [TAGS.catalog, TAGS.offers, TAGS.businesses, TAGS.slugs],
} satisfies Record<string, Tag[]>;

/** Marks the enclosing "use cache" function as hourly data with these tags. */
export function cacheFor(...tags: Tag[]) {
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

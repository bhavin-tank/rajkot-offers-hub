import { cacheLife, cacheTag } from "next/cache";
import { toIsoDay } from "@/lib/format";

/**
 * Guest reads from the API are cached here for a few minutes; the API caches
 * them too and invalidates its copy on every vendor or admin write, so a short
 * life keeps the site close behind.
 */
export const TAGS = { offers: "offers", catalog: "catalog", businesses: "businesses" } as const;

export type Tag = (typeof TAGS)[keyof typeof TAGS];

/** Marks the enclosing "use cache" function as short-lived API data with these tags. */
export function cacheFor(...tags: Tag[]) {
  cacheLife("minutes");
  cacheTag(...tags);
}

/** Today in Rajkot; offers start and end on Rajkot calendar days. */
export function today() {
  return toIsoDay(new Date());
}

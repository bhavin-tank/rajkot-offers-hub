import type { MetadataRoute } from "next";
import { cacheFor, getSlugs, TAGS, today } from "@/lib/data/cache";
import { offersPath } from "@/lib/areas";
import { absoluteUrl } from "@/lib/site";
import { findBusinesses } from "@/server/services/businesses";
import { findLiveOffers } from "@/server/services/offers";
import type { Offer } from "@/types";

/** Newest offer date in `list`, as the last-modified date of the page listing them. */
function newest(list: Offer[]) {
  return list.reduce<string | undefined>((max, o) => (!max || o.createdAt > max ? o.createdAt : max), undefined);
}

/**
 * Every page worth ranking: the main pages, offer lists that have live offers
 * (all of Rajkot, each area, each category, each area × category), live offers
 * and business profiles. Empty lists and expired offers are left out; their
 * pages are also marked noindex. "/categories/<slug>" pages are left out too:
 * they show the same offers as "/offers/<slug>", which is their canonical URL.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheFor(TAGS.offers, TAGS.catalog, TAGS.businesses);

  const [live, businesses, slugs] = await Promise.all([findLiveOffers("en", today()), findBusinesses("en"), getSlugs()]);
  const entry = (path: string, list?: Offer[], images?: string[]): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    ...(list && { lastModified: newest(list) }),
    ...(images?.length && { images }),
  });

  const lists: MetadataRoute.Sitemap = [];
  for (const area of [undefined, ...slugs.areas]) {
    const inArea = live.filter((o) => !area || o.areaSlug === area);
    if (!inArea.length) continue;
    if (area) lists.push(entry(offersPath(area), inArea));
    for (const slug of slugs.categories) {
      const inCategory = inArea.filter((o) => o.categorySlug === slug);
      if (inCategory.length) lists.push(entry(offersPath(area, slug), inCategory));
    }
  }

  return [
    entry("/", live),
    entry("/offers", live),
    entry("/categories", live),
    entry("/how-it-works"),
    entry("/contact"),
    entry("/submit-offer"),
    ...lists,
    ...live.map((o) => entry(`/offers/${o.slug}`, [o], o.images.slice(0, 1))),
    ...businesses.map((b) =>
      entry(
        `/businesses/${b.slug}`,
        live.filter((o) => o.businessSlug === b.slug),
        [b.cover],
      ),
    ),
  ];
}

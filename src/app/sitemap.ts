import type { MetadataRoute } from "next";
import { getAreaSlugs, getBusinessSlugs, getCategories, getLiveOffers } from "@/lib/data";
import { offersPath } from "@/lib/areas";
import { absoluteUrl } from "@/lib/site";
import type { OfferSummary } from "@/types";

/** Latest end date in `list`, as a last-modified hint for the page listing them. */
function newest(list: OfferSummary[]) {
  return list.reduce<string | undefined>((max, o) => (!max || o.validTo > max ? o.validTo : max), undefined);
}

/**
 * Every page worth ranking: the main pages, offer lists that have live offers
 * (all of Rajkot, each area, each category, each area × category), live offers
 * and business profiles. Empty lists and expired offers are left out; their
 * pages are also marked noindex. "/categories/<slug>" pages are left out too:
 * they show the same offers as "/offers/<slug>", which is their canonical URL.
 */
// Rendered per request: a prerendered sitemap would refresh itself in the background, which hangs on Workers.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const [live, businessSlugs, areaSlugs, categories] = await Promise.all([getLiveOffers(), getBusinessSlugs(), getAreaSlugs(), getCategories()]);
  const entry = (path: string, list?: OfferSummary[], images?: string[]): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    ...(list?.length && { lastModified: newest(list) }),
    ...(images?.length && { images }),
  });

  // Category and area × category lists, only where the API counts live offers.
  const lists: MetadataRoute.Sitemap = categories.filter((c) => c.offerCount > 0).map((c) => entry(offersPath(undefined, c.slug)));
  for (const area of areaSlugs) {
    lists.push(entry(offersPath(area)));
    for (const category of await getCategories(area)) {
      if (category.offerCount > 0) lists.push(entry(offersPath(area, category.slug)));
    }
  }

  return [
    entry("/", live),
    entry("/offers", live),
    entry("/categories"),
    entry("/how-it-works"),
    entry("/contact"),
    entry("/submit-offer"),
    entry("/privacy"),
    entry("/terms"),
    ...lists,
    ...live.map((o) => entry(`/offers/${o.slug}`, [o], o.images.slice(0, 1))),
    ...businessSlugs.map((slug) => entry(`/businesses/${slug}`)),
  ];
}

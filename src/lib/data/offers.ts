import type { Locale } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import {
  findAllOfferSummaries,
  findBusinessOffers,
  findOffer,
  findOffers,
  findOffersBySlugs,
  findSimilarOffers,
  type Window,
} from "@/server/services/offers";
import type { Offer, OfferFilters, OfferSummary, Paged } from "@/types";
import { cacheFor, getSlugs, TAGS, today } from "./cache";

export const PAGE_SIZE = 9;

/*
 * The `…For(locale, …)` functions are the cached reads. Pages use the getters
 * below them, which take the locale from the route; API routes, which have no
 * [lang] segment, call the `…For` functions with `?lang=`.
 */

export async function offersFor(locale: Locale, filters: OfferFilters, window: Window) {
  "use cache";
  cacheFor(TAGS.offers, TAGS.catalog);
  return findOffers(filters, locale, today(), window);
}

export async function offerFor(locale: Locale, slug: string) {
  "use cache";
  cacheFor(TAGS.offers);
  return findOffer(slug, locale, today());
}

export async function similarOffersFor(locale: Locale, offer: Pick<Offer, "slug" | "categorySlug">, limit: number) {
  "use cache";
  cacheFor(TAGS.offers);
  return findSimilarOffers(offer, locale, today(), limit);
}

export async function businessOffersFor(locale: Locale, businessSlug: string) {
  "use cache";
  cacheFor(TAGS.offers);
  return findBusinessOffers(businessSlug, locale, today());
}

export async function offersBySlugsFor(locale: Locale, slugs: string[]) {
  "use cache";
  cacheFor(TAGS.offers);
  return findOffersBySlugs(slugs, locale, today());
}

async function allOfferSummariesFor(locale: Locale) {
  "use cache";
  cacheFor(TAGS.offers);
  return findAllOfferSummaries(locale, today());
}

export async function getOffers(filters: OfferFilters = {}): Promise<Paged<OfferSummary>> {
  const page = Math.max(1, filters.page ?? 1);
  // "Load more" shows every page up to the requested one.
  const { items, total } = await offersFor(await getLocale(), { ...filters, page: undefined }, { limit: page * PAGE_SIZE });
  return { items, total, page, hasMore: items.length < total };
}

export async function getOffer(slug: string): Promise<Offer | undefined> {
  return offerFor(await getLocale(), slug);
}

export async function getSimilarOffers(offer: Offer, limit = 4): Promise<OfferSummary[]> {
  return similarOffersFor(await getLocale(), { slug: offer.slug, categorySlug: offer.categorySlug }, limit);
}

/** Offers ending soonest; shown as "today's offers" on the home page. */
export async function getTodayOffers(limit = 6): Promise<OfferSummary[]> {
  return (await getOffers({ sort: "ending" })).items.slice(0, limit);
}

export async function getLatestOffers(limit = 6): Promise<OfferSummary[]> {
  const today = new Set((await getTodayOffers()).map((o) => o.slug));
  const { items } = await getOffers({ sort: "newest", page: 3 });
  return items.filter((o) => !today.has(o.slug)).slice(0, limit);
}

export async function getBusinessOffers(businessSlug: string) {
  return businessOffersFor(await getLocale(), businessSlug);
}

export async function getOfferSummaries(): Promise<OfferSummary[]> {
  return allOfferSummariesFor(await getLocale());
}

export async function getOfferSlugs() {
  return (await getSlugs()).offers;
}

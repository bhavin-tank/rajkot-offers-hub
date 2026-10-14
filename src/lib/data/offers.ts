import { api, orUndefined } from "@/lib/api/client";
import { offerIdFromHandle, toOffer, toOfferSummary, TYPE_TO_API } from "@/lib/api/mappers";
import type { Page, PromotionCard, PromotionDetail } from "@/lib/api/types";
import type { Offer, OfferFilters, OfferSummary, Paged, SortKey, ValidityKey } from "@/types";
import { getBusiness } from "./businesses";
import { cacheFor, TAGS } from "./cache";
import { areaName } from "./categories";

export const PAGE_SIZE = 9;
const MAX_PER_PAGE = 100;

const SORTS: Record<SortKey, string> = { newest: "latest", ending: "ending_soon", discount: "biggest_discount" };
const ENDS_WITHIN_DAYS: Record<ValidityKey, number> = { today: 0, week: 7, month: 30 };

type FeedQuery = Record<string, string | number | string[] | undefined>;

/**
 * One page of the API feed as cards, cached by its query. Cards are built inside
 * the cache: `daysLeft` reads today's date, which a prerender may only do there.
 */
async function feed(query: FeedQuery): Promise<{ items: OfferSummary[]; total: number }> {
  "use cache";
  cacheFor(TAGS.offers);
  const page = await api<Page<PromotionCard>>("/promotions", { query });
  return { items: page.data.map(toOfferSummary), total: page.meta.total };
}

/** The site's filters as the API's query. Null when an area has no live offers (so nothing can match). */
async function feedQuery(filters: OfferFilters): Promise<FeedQuery | null> {
  const areas = filters.areas?.length ? await Promise.all(filters.areas.map(areaName)) : [];
  if (areas.some((name) => !name)) return null;
  return {
    q: filters.q,
    category: filters.subcategory || filters.category,
    areas: areas.length ? (areas as string[]) : undefined,
    type: filters.type ? TYPE_TO_API[filters.type] : undefined,
    ends_within_days: filters.validity ? ENDS_WITHIN_DAYS[filters.validity] : undefined,
    sort: SORTS[filters.sort ?? "newest"],
  };
}

export async function getOffers(filters: OfferFilters = {}): Promise<Paged<OfferSummary>> {
  const page = Math.max(1, filters.page ?? 1);
  const query = await feedQuery(filters);
  if (!query) return { items: [], total: 0, page, hasMore: false };
  // "Load more" shows every page up to the requested one.
  const { items, total } = await feed({ ...query, per_page: Math.min(page * PAGE_SIZE, MAX_PER_PAGE) });
  return { items, total, page, hasMore: items.length < total };
}

async function promotion(id: string): Promise<PromotionDetail | undefined> {
  return (await orUndefined(api<{ data: PromotionDetail }>(`/promotions/${id}`)))?.data;
}

async function offerById(id: string): Promise<Offer | undefined> {
  "use cache";
  cacheFor(TAGS.offers, TAGS.businesses);
  const detail = await promotion(id);
  if (!detail) return undefined;
  return toOffer(detail, await getBusiness(detail.business.slug));
}

async function offerCard(id: string): Promise<OfferSummary | undefined> {
  "use cache";
  cacheFor(TAGS.offers);
  const detail = await promotion(id);
  return detail && toOfferSummary(detail);
}

/** One offer by its handle ("<slug>-<id>"), live or past. */
export async function getOffer(handle: string): Promise<Offer | undefined> {
  const id = offerIdFromHandle(handle);
  return id ? offerById(id) : undefined;
}

/** Live offers in the same category first, then the rest. */
export async function getSimilarOffers(offer: Offer, limit = 4): Promise<OfferSummary[]> {
  const [same, rest] = await Promise.all([
    offer.categorySlug ? feed({ category: offer.categorySlug, per_page: limit + 1 }) : Promise.resolve({ items: [] as OfferSummary[] }),
    feed({ sort: "recommended", per_page: limit + 1 }),
  ]);
  const seen = new Set([offer.id]);
  const picks: OfferSummary[] = [];
  for (const card of [...same.items, ...rest.items]) {
    if (seen.has(card.id)) continue;
    seen.add(card.id);
    picks.push(card);
  }
  return picks.slice(0, limit);
}

/** Offers ending soonest; shown as "today's offers" on the home page. */
export async function getTodayOffers(limit = 6): Promise<OfferSummary[]> {
  return (await feed({ sort: "ending_soon", per_page: limit })).items;
}

export async function getLatestOffers(limit = 6): Promise<OfferSummary[]> {
  const today = new Set((await getTodayOffers()).map((o) => o.id));
  const { items } = await feed({ sort: "latest", per_page: limit * 2 });
  return items.filter((card) => !today.has(card.id)).slice(0, limit);
}

/** A shop's live offers and its past ones. */
export async function getBusinessOffers(businessSlug: string) {
  const [active, expired] = await Promise.all([
    feed({ business: businessSlug, sort: "latest", per_page: 50 }),
    feed({ business: businessSlug, lifecycle: "ended", per_page: 24 }),
  ]);
  return { active: active.items, expired: expired.items };
}

/** Cards for the given handles (e.g. saved offers), in that order; unknown or unpublished ones are skipped. */
export async function getOffersByHandles(handles: string[]): Promise<OfferSummary[]> {
  const ids = handles.map(offerIdFromHandle).filter((id): id is string => Boolean(id)).slice(0, 60);
  const cards = await Promise.all(ids.map(offerCard));
  return cards.filter((card): card is OfferSummary => Boolean(card));
}

/** Every live offer's handle, for static params and the sitemap. */
export async function getLiveOffers(): Promise<OfferSummary[]> {
  "use cache";
  cacheFor(TAGS.offers);
  const offers: OfferSummary[] = [];
  for (let page = 1; page <= 50; page++) {
    const result = await api<Page<PromotionCard>>("/promotions", { query: { per_page: MAX_PER_PAGE, page, sort: "latest" } });
    offers.push(...result.data.map(toOfferSummary));
    if (page >= result.meta.last_page) break;
  }
  return offers;
}

export async function getOfferSlugs() {
  return (await getLiveOffers()).map((o) => o.slug);
}

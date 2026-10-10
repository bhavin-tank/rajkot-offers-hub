import { cacheLife, cacheTag } from "next/cache";
import type { Category, Offer, OfferFilters, OfferSummary, Paged, ValidityKey } from "@/types";
import { offers as offerRecords } from "@/lib/mock/offers";
import { getLocale } from "@/lib/i18n/server";
import { buildOffers, localizedCategories } from "./catalog";

export const PAGE_SIZE = 9;

const VALIDITY_DAYS: Record<ValidityKey, number> = { today: 1, week: 7, month: 30 };

/** Every offer, including expired ones. */
export async function getAllOffers(): Promise<Offer[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("offers");
  return buildOffers(new Date(), await getLocale());
}

export function toSummary(offer: Offer): OfferSummary {
  return {
    slug: offer.slug,
    title: offer.title,
    badge: offer.badge,
    businessName: offer.businessName,
    areaName: offer.areaName,
    images: offer.images.slice(0, 1),
    validTo: offer.validTo,
    isExpired: offer.isExpired,
    daysLeft: offer.daysLeft,
  };
}

function matchesQuery(offer: Offer, q: string, categories: Category[]) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const category = categories.find((c) => c.slug === offer.categorySlug);
  return [offer.title, offer.businessName, offer.areaName, category?.name, category?.shortName]
    .filter(Boolean)
    .some((field) => field!.toLowerCase().includes(needle));
}

export async function getOffers(filters: OfferFilters = {}): Promise<Paged<OfferSummary>> {
  const page = Math.max(1, filters.page ?? 1);
  let list = (await getAllOffers()).filter((o) => !o.isExpired);

  if (filters.q) {
    const localized = localizedCategories(await getLocale());
    list = list.filter((o) => matchesQuery(o, filters.q!, localized));
  }
  if (filters.category) list = list.filter((o) => o.categorySlug === filters.category);
  if (filters.subcategory) list = list.filter((o) => o.subcategory === filters.subcategory);
  if (filters.areas?.length) list = list.filter((o) => filters.areas!.includes(o.areaSlug));
  if (filters.type) list = list.filter((o) => o.type === filters.type);
  if (filters.validity) {
    const max = VALIDITY_DAYS[filters.validity];
    list = list.filter((o) => o.daysLeft <= max);
  }

  const sort = filters.sort ?? "newest";
  list = [...list].sort((a, b) => {
    if (sort === "ending") return a.daysLeft - b.daysLeft;
    if (sort === "discount") return b.discount - a.discount;
    return b.createdAt.localeCompare(a.createdAt) || a.daysLeft - b.daysLeft;
  });

  // "Load more" shows every page up to the requested one.
  const items = list.slice(0, page * PAGE_SIZE);
  return {
    items: items.map(toSummary),
    total: list.length,
    page,
    hasMore: items.length < list.length,
  };
}

export async function getOffer(slug: string): Promise<Offer | undefined> {
  return (await getAllOffers()).find((o) => o.slug === slug);
}

export async function getSimilarOffers(offer: Offer, limit = 4): Promise<OfferSummary[]> {
  const all = (await getAllOffers()).filter((o) => !o.isExpired && o.slug !== offer.slug);
  const sameCategory = all.filter((o) => o.categorySlug === offer.categorySlug);
  const others = all.filter((o) => o.categorySlug !== offer.categorySlug);
  return [...sameCategory, ...others].slice(0, limit).map(toSummary);
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
  const list = (await getAllOffers()).filter((o) => o.businessSlug === businessSlug);
  return {
    active: list.filter((o) => !o.isExpired).map(toSummary),
    expired: list.filter((o) => o.isExpired).map(toSummary),
  };
}

export async function getOfferSummaries(): Promise<OfferSummary[]> {
  return (await getAllOffers()).map(toSummary);
}

export function getOfferSlugs() {
  return offerRecords.map((o) => o.slug);
}

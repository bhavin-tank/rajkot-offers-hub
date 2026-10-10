import type { Filter, Sort } from "mongodb";
import { addDays, daysBetween, toIsoDay } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Offer, OfferFilters, OfferSummary, SortKey, ValidityKey } from "@/types";
import { collections, type OfferDoc } from "../db/models";
import { pick } from "../lib/i18n";
import { findCategoryDocs } from "./catalog";
import { liveOfferFilter, publicOfferFilter } from "./visibility";

const VALIDITY_DAYS: Record<ValidityKey, number> = { today: 1, week: 7, month: 30 };

/** `sortOrder` breaks ties so pages never shuffle between requests. */
const SORTS: Record<SortKey, Sort> = {
  newest: { createdAt: -1, validTo: 1, sortOrder: 1 },
  ending: { validTo: 1, sortOrder: 1 },
  discount: { discount: -1, sortOrder: 1 },
};

/** Fields an offer card needs; keeps list queries small. */
const SUMMARY_FIELDS = { slug: 1, title: 1, badge: 1, businessName: 1, areaName: 1, images: { $slice: 1 }, validTo: 1 } as const;

type SummaryDoc = Pick<OfferDoc, "slug" | "title" | "badge" | "businessName" | "areaName" | "images" | "validTo">;

export function toSummary(doc: SummaryDoc, locale: Locale, today: string): OfferSummary {
  return {
    slug: doc.slug,
    title: pick(doc.title, locale),
    badge: pick(doc.badge, locale),
    businessName: doc.businessName,
    areaName: pick(doc.areaName, locale),
    images: doc.images.slice(0, 1),
    validTo: doc.validTo,
    isExpired: doc.validTo < today,
    daysLeft: daysBetween(today, doc.validTo),
  };
}

export function toOffer(doc: OfferDoc, locale: Locale, today: string): Offer {
  const title = pick(doc.title, locale);
  return {
    ...toSummary(doc, locale, today),
    type: doc.type,
    discount: doc.discount,
    categorySlug: doc.categorySlug,
    ...(doc.subcategory && { subcategory: doc.subcategory }),
    businessSlug: doc.businessSlug,
    areaSlug: doc.areaSlug,
    images: doc.images,
    offerText: doc.offerText ? pick(doc.offerText, locale) : title,
    validFrom: doc.validFrom,
    createdAt: toIsoDay(doc.createdAt),
    timings: pick(doc.timings, locale),
    address: pick(doc.address, locale),
    steps: doc.steps.map((s) => ({ text: pick(s.text, locale) })),
    terms: doc.terms.map((t) => pick(t, locale)),
  };
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Matches the offer title, business, area or category name, in either language. */
async function searchFilter(q: string): Promise<Filter<OfferDoc> | undefined> {
  const needle = q.trim();
  if (!needle) return undefined;
  const re = new RegExp(escapeRegex(needle), "i");
  const categorySlugs = (await findCategoryDocs())
    .filter((c) => [c.name.en, c.name.gu, c.shortName.en, c.shortName.gu].some((name) => name && re.test(name)))
    .map((c) => c.slug);
  return {
    $or: [
      { "title.en": re },
      { "title.gu": re },
      { businessName: re },
      { "areaName.en": re },
      { "areaName.gu": re },
      ...(categorySlugs.length ? [{ categorySlug: { $in: categorySlugs } }] : []),
    ],
  };
}

export interface Window {
  skip?: number;
  limit: number;
}

/** Live offers matching `filters`, newest first unless `filters.sort` says otherwise. */
export async function findOffers(
  filters: OfferFilters,
  locale: Locale,
  today: string,
  { skip = 0, limit }: Window,
): Promise<{ items: OfferSummary[]; total: number }> {
  const query: Filter<OfferDoc> = { ...liveOfferFilter(today) };
  if (filters.category) query.categorySlug = filters.category;
  if (filters.subcategory) query.subcategory = filters.subcategory;
  if (filters.areas?.length) query.areaSlug = { $in: filters.areas };
  if (filters.type) query.type = filters.type;
  if (filters.validity) query.validTo = { $gte: today, $lte: addDays(today, VALIDITY_DAYS[filters.validity]) };
  const search = filters.q ? await searchFilter(filters.q) : undefined;
  if (search) Object.assign(query, search);

  const { offers } = await collections();
  const [docs, total] = await Promise.all([
    offers
      .find(query, { projection: SUMMARY_FIELDS })
      .sort(SORTS[filters.sort ?? "newest"])
      .skip(skip)
      .limit(limit)
      .toArray(),
    offers.countDocuments(query),
  ]);
  return { items: docs.map((doc) => toSummary(doc, locale, today)), total };
}

/** One offer by slug, live or past; undefined when unknown or not public. */
export async function findOffer(slug: string, locale: Locale, today: string): Promise<Offer | undefined> {
  const { offers } = await collections();
  const doc = await offers.findOne({ slug, ...publicOfferFilter() });
  return doc ? toOffer(doc, locale, today) : undefined;
}

/** Live offers in the same category first, then any other live offers. */
export async function findSimilarOffers(
  offer: Pick<Offer, "slug" | "categorySlug">,
  locale: Locale,
  today: string,
  limit: number,
): Promise<OfferSummary[]> {
  const { offers } = await collections();
  const live = { ...liveOfferFilter(today), slug: { $ne: offer.slug } };
  const same = await offers
    .find({ ...live, categorySlug: offer.categorySlug }, { projection: SUMMARY_FIELDS })
    .sort({ sortOrder: 1 })
    .limit(limit)
    .toArray();
  const others =
    same.length < limit
      ? await offers
          .find({ ...live, categorySlug: { $ne: offer.categorySlug } }, { projection: SUMMARY_FIELDS })
          .sort({ sortOrder: 1 })
          .limit(limit - same.length)
          .toArray()
      : [];
  return [...same, ...others].map((doc) => toSummary(doc, locale, today));
}

/** A business's live offers and its past ones. */
export async function findBusinessOffers(businessSlug: string, locale: Locale, today: string) {
  const { offers } = await collections();
  const [active, expired] = await Promise.all([
    offers.find({ businessSlug, ...liveOfferFilter(today) }, { projection: SUMMARY_FIELDS }).sort({ sortOrder: 1 }).toArray(),
    offers
      .find({ businessSlug, ...publicOfferFilter(), validTo: { $lt: today } }, { projection: SUMMARY_FIELDS })
      .sort({ validTo: -1, sortOrder: 1 })
      .toArray(),
  ]);
  return {
    active: active.map((doc) => toSummary(doc, locale, today)),
    expired: expired.map((doc) => toSummary(doc, locale, today)),
  };
}

/** Cards for the given slugs (e.g. saved offers), live or past, in the order asked. Unknown slugs are skipped. */
export async function findOffersBySlugs(slugs: string[], locale: Locale, today: string): Promise<OfferSummary[]> {
  const { offers } = await collections();
  const docs = await offers.find({ slug: { $in: slugs }, ...publicOfferFilter() }, { projection: SUMMARY_FIELDS }).toArray();
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));
  return slugs.flatMap((slug) => {
    const doc = bySlug.get(slug);
    return doc ? [toSummary(doc, locale, today)] : [];
  });
}

/** Cards for every public offer, live or past. */
export async function findAllOfferSummaries(locale: Locale, today: string): Promise<OfferSummary[]> {
  const { offers } = await collections();
  const docs = await offers.find(publicOfferFilter(), { projection: SUMMARY_FIELDS }).sort({ sortOrder: 1 }).toArray();
  return docs.map((doc) => toSummary(doc, locale, today));
}

/** Every live offer in full, for the sitemap. */
export async function findLiveOffers(locale: Locale, today: string): Promise<Offer[]> {
  const { offers } = await collections();
  const docs = await offers.find(liveOfferFilter(today)).sort({ sortOrder: 1 }).toArray();
  return docs.map((doc) => toOffer(doc, locale, today));
}

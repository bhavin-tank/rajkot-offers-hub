import { getBusiness } from "@/lib/data/businesses";
import { getNear } from "@/lib/data/locations";
import { getFeaturedOffers, getLatestOffers, getOffersPage } from "@/lib/data/offers";
import type { OfferSummary } from "@/types";
import { CLIP_MAX_SECONDS, CLIP_MIN_SECONDS, type ZalakClip, type ZalakShop, type ZalakStory } from "./types";

/**
 * MOCK. The API has no reels or statuses yet, so these feeds are built from live offers: each offer's
 * photos become the clips, and a post with a single photo borrows the next offer's as a second angle.
 * When the API ships, replace the bodies of `getZalakFeed` and `getStatusFeed` and nothing else changes.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** A steady 5–15 s per clip, so the same post always plays for the same time. */
function clipSeconds(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return CLIP_MIN_SECONDS + (hash % (CLIP_MAX_SECONDS - CLIP_MIN_SECONDS + 1));
}

/** Offers with a photo, deduplicated: nearest first when the visitor shared a location, else featured then newest. */
async function pool() {
  const near = await getNear();
  const candidates = near
    ? (await Promise.all([1, 2, 3].map((page) => getOffersPage({ near, sort: "nearest" }, page)))).flatMap((result) => result.items)
    : (await Promise.all([getFeaturedOffers(12), getLatestOffers(12)])).flat();
  const seen = new Set<string>();
  const offers: OfferSummary[] = [];
  for (const offer of candidates) {
    if (seen.has(offer.id) || offer.imageIsLogo || offer.images.length === 0) continue;
    seen.add(offer.id);
    offers.push(offer);
  }
  return offers;
}

async function shopsFor(offers: OfferSummary[]) {
  const slugs = [...new Set(offers.map((offer) => offer.businessSlug))];
  const logos = await Promise.all(
    slugs.map((slug) =>
      getBusiness(slug).then(
        (business) => business?.logo,
        () => undefined,
      ),
    ),
  );
  return new Map(slugs.map((slug, i) => [slug, logos[i]]));
}

function toStory(kind: ZalakStory["kind"], offer: OfferSummary, index: number, offers: OfferSummary[], logos: Map<string, string | undefined>): ZalakStory {
  const images = [...offer.images];
  for (let step = 1; images.length < 2 && step < offers.length; step++) images.push(offers[(index + step) % offers.length].images[0]);
  const clips: ZalakClip[] = images.slice(0, 3).map((src, i) => ({ kind: "image", src, seconds: clipSeconds(`${offer.id}${i}`) }));
  const shop: ZalakShop = { slug: offer.businessSlug, name: offer.businessName, logo: logos.get(offer.businessSlug), areaName: offer.areaName };
  // Mock: spread the statuses over the last few hours.
  const postedAt = kind === "status" ? new Date(Date.now() - (1 + (index % 6)) * 60 * 60 * 1000).toISOString() : offer.createdAt;
  return {
    id: `${kind}-${offer.id}`,
    kind,
    shop,
    title: offer.title,
    caption: offer.badge,
    offer: { slug: offer.slug, urlSlug: offer.urlSlug, businessSlug: offer.businessSlug },
    distanceKm: offer.distanceKm,
    postedAt,
    expiresAt: kind === "status" ? new Date(new Date(postedAt).getTime() + DAY_MS).toISOString() : undefined,
    clips,
  };
}

/** Reels for the Zalak tab, newest first. The feed pages: ask for the next `offset` as the visitor scrolls. */
export async function getZalakFeed(limit = 12, offset = 0): Promise<ZalakStory[]> {
  const all = await pool();
  const offers = all.slice(offset, offset + limit);
  const logos = await shopsFor(offers);
  return offers.map((offer, i) => toStory("reel", offer, offset + i, all, logos));
}

/** One status per shop that has something today, for the row on the home page. */
export async function getStatusFeed(limit = 8): Promise<ZalakStory[]> {
  const all = await pool();
  const seen = new Set<string>();
  const offers = all.filter((offer) => !seen.has(offer.businessSlug) && seen.add(offer.businessSlug)).slice(0, limit);
  const logos = await shopsFor(offers);
  return offers.map((offer, i) => toStory("status", offer, i, all, logos));
}

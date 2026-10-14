import { daysBetween, toIsoDay } from "@/lib/format";
import { img } from "@/lib/mock/images";
import type { Area, Business, Category, CategoryIcon, Offer, OfferSummary, OfferType, OpeningHours } from "@/types";
import type { AreaCount, BusinessHours, BusinessResource, CategoryChip, PromotionCard, PromotionDetail, PromotionType } from "./types";

/**
 * API resources → the site's domain types (`@/types`), so pages and components
 * stay as they were. Everything the API does not send is derived here.
 */

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** "/offers/<slug>-<id>": readable, and the id is what the API looks offers up by. */
export function offerHandle(card: Pick<PromotionCard, "slug" | "id">) {
  return `${card.slug}-${card.id}`;
}

/** The API id inside an offer handle, or null when it is not one. */
export function offerIdFromHandle(handle: string) {
  return handle.match(UUID)?.[0]?.toLowerCase() ?? null;
}

const TYPE_FROM_API: Record<PromotionType, OfferType> = {
  percent_off: "percent",
  amount_off: "flat",
  buy_x_get_y: "bogo",
  free_gift: "other",
  custom: "combo",
};

/** The site's filter value → the API's `type`. */
export const TYPE_TO_API: Record<OfferType, PromotionType> = {
  percent: "percent_off",
  flat: "amount_off",
  bogo: "buy_x_get_y",
  other: "free_gift",
  combo: "custom",
};

/** Rajkot day of an API timestamp. */
const day = (timestamp: string) => toIsoDay(new Date(timestamp));

function isPast(card: Pick<PromotionCard, "lifecycle">) {
  return card.lifecycle === "expired" || card.lifecycle === "ended" || card.lifecycle === "taken_down";
}

export function toOfferSummary(card: PromotionCard | PromotionDetail): OfferSummary {
  const validTo = day(card.ends_at);
  // Cards carry `cover_url`; the detail resource carries a `cover` object instead.
  const cover = card.cover_url || ("cover" in card ? card.cover?.url : undefined) || card.cover_thumb_url;
  return {
    id: card.id,
    slug: offerHandle(card),
    title: card.title,
    badge: card.headline || card.value_label,
    businessName: card.business.name,
    areaName: card.business.area || card.business.city || "Rajkot",
    images: [cover || FALLBACK_IMAGE],
    validTo,
    isExpired: isPast(card),
    daysLeft: daysBetween(toIsoDay(new Date()), validTo),
  };
}

const STEPS: Record<PromotionDetail["redemption_mode"], string[]> = {
  walk_in: ["Visit the store", "Show this offer", "Get the discount on your bill"],
  shared_code: ["Tap “Show code” to see the offer code", "Show the code at the store", "Get the discount on your bill"],
  unique_claim: ["Claim your personal code here", "Show the code at the store", "Get the discount on your bill"],
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "14:30" → "2:30 PM". */
function clock(time: string) {
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 || 12;
  return `${hour12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

function timings(detail: PromotionDetail) {
  const hours = detail.available_from && detail.available_until ? `${clock(detail.available_from)} – ${clock(detail.available_until)}` : "During store hours";
  const days = detail.available_days?.length && detail.available_days.length < 7 ? detail.available_days.map((d) => WEEKDAYS[d - 1]).join(", ") : null;
  return days ? `${days}, ${hours}` : hours;
}

export function toOffer(detail: PromotionDetail, business?: Business): Offer {
  const summary = toOfferSummary(detail);
  const images = [detail.cover?.url, ...detail.gallery.map((m) => m.url)].filter((url): url is string => Boolean(url));
  return {
    ...summary,
    images: images.length ? images : summary.images,
    type: TYPE_FROM_API[detail.type],
    discount: detail.discount_percent ?? 0,
    categorySlug: detail.categories[0]?.slug ?? business?.categorySlug ?? "",
    businessSlug: detail.business.slug,
    areaSlug: business?.areaSlug ?? "",
    offerText: detail.description || detail.headline || detail.title,
    validFrom: day(detail.starts_at),
    createdAt: day(detail.created_at),
    timings: timings(detail),
    address: business?.address ?? [detail.business.area, detail.business.city].filter(Boolean).join(", "),
    steps: STEPS[detail.redemption_mode].map((text) => ({ text })),
    terms: (detail.terms ?? "").split("\n").map((t) => t.trim()).filter(Boolean),
    redemptionMode: detail.redemption_mode,
  };
}

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function toHours(hours: BusinessHours | null): OpeningHours[] {
  return DAY_KEYS.map((key, day) => {
    const first = hours?.[key]?.[0];
    return { day, opens: first?.open ?? null, closes: first?.close ?? null };
  });
}

/** "https://instagram.com/samplecafe" → "samplecafe"; masked links give nothing. */
function instagramHandle(url: string | undefined) {
  if (!url || url.includes("•")) return undefined;
  return url.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "") || undefined;
}

const RAJKOT = { lat: 22.3039, lng: 70.8022 };

export function toBusiness(resource: BusinessResource): Business {
  const address = resource.addresses.find((a) => a.is_primary) ?? resource.addresses[0];
  const phone = resource.phones.find((p) => p.is_primary) ?? resource.phones[0];
  const whatsapp = resource.phones.find((p) => p.is_whatsapp) ?? phone;
  const category = resource.categories.find((c) => c.is_primary) ?? resource.categories[0];
  const website = resource.links.find((l) => l.type === "website")?.url;
  const areaName = address?.area || address?.city || "Rajkot";
  const street = [address?.address_line1, address?.address_line2, address?.landmark].filter(Boolean).join(", ");
  const city = [address?.city || "Rajkot", address?.postal_code].filter(Boolean).join(" ");
  const cover = resource.cover?.url ?? resource.gallery[0]?.url ?? FALLBACK_IMAGE;
  return {
    slug: resource.slug,
    name: resource.name,
    categorySlug: category?.slug ?? "",
    categoryName: category?.name ?? "",
    areaSlug: slugify(areaName),
    areaName,
    cover,
    about: resource.description || resource.tagline || "",
    address: [street, address?.area, city].filter(Boolean).join(", "),
    streetAddress: street,
    postalCode: address?.postal_code ?? "",
    phone: phone?.full_number ?? "",
    whatsapp: whatsapp?.full_number ?? "",
    contactMasked: resource.is_contact_masked,
    instagram: instagramHandle(resource.links.find((l) => l.type === "instagram")?.url),
    website: website && !website.includes("•") ? website : undefined,
    hours: toHours(resource.business_hours),
    photos: resource.gallery.length ? resource.gallery.map((m) => m.url) : [cover],
    geo: {
      lat: Number(address?.latitude) || RAJKOT.lat,
      lng: Number(address?.longitude) || RAJKOT.lng,
    },
  };
}

export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toArea(area: AreaCount): Area & { offerCount: number } {
  return { slug: area.slug, name: area.name, offerCount: area.promotions_count };
}

// Category artwork: the API has no images for the offer categories yet.

const FALLBACK_IMAGE = img("photo-1441986300917-64674bd600d8", 800);

const ART: { match: RegExp; icon: CategoryIcon; image: string }[] = [
  { match: /restaurant|cafe|bakery|food|sweets|farsan/, icon: "utensils", image: img("photo-1504674900247-0877df9cc836", 600) },
  { match: /apparel|wear|footwear|bag|jewel|watch/, icon: "shirt", image: img("photo-1441986300917-64674bd600d8", 600) },
  { match: /salon|spa|beauty|health|wellness/, icon: "scissors", image: img("photo-1560066984-138dadb4c035", 600) },
  { match: /electronic|mobile|appliance/, icon: "smartphone", image: img("photo-1505740420928-5e560c06d30e", 600) },
  { match: /fitness|gym|yoga|sport/, icon: "dumbbell", image: img("photo-1534438327276-14e5300c3a48", 600) },
  { match: /home|living|grocery|daily/, icon: "sofa", image: img("photo-1555041469-a586c61ea9bc", 600) },
  { match: /entertainment|cinema|gaming/, icon: "ticket", image: img("photo-1489599849927-2ee91cede3ba", 600) },
  { match: /service|automobile|education|coaching|travel/, icon: "wrench", image: img("photo-1581578731548-c64695cc6952", 600) },
  { match: /gift|toy|book/, icon: "gift", image: img("photo-1567401893414-76b7b1e5a7a5", 600) },
];

function art(slug: string) {
  return ART.find((a) => a.match.test(slug)) ?? { icon: "gift" as const, image: FALLBACK_IMAGE };
}

/** A category chip → the site's `Category` (+ count). The first `homeRow` categories with offers show on the home page. */
export function toCategory(chip: CategoryChip, subcategories: Category["subcategories"] = []): Category & { offerCount: number } {
  const { icon, image } = art(chip.slug);
  const short = chip.name.split(/ & | and /)[0];
  return {
    slug: chip.slug,
    name: chip.name,
    shortName: short.length <= 16 ? short : chip.name,
    icon,
    image,
    description: `Offers on ${chip.name.toLowerCase()} in Rajkot`,
    subcategories,
    inHomeRow: chip.promotions_count > 0,
    offerCount: chip.promotions_count,
  };
}

export type CategoryIcon =
  | "utensils"
  | "shirt"
  | "scissors"
  | "smartphone"
  | "dumbbell"
  | "sofa"
  | "wrench"
  | "gift"
  | "ticket";

export interface Category {
  slug: string;
  /** Full name, e.g. "Fashion & Clothing". */
  name: string;
  /** Short label for chips and the home icon row, e.g. "Fashion". */
  shortName: string;
  icon: CategoryIcon;
  image: string;
  description: string;
  /** Child categories; `slug` is the filter value. Empty in lists that don't need them. */
  subcategories: { slug: string; name: string }[];
  /** Shown in the home icon row. */
  inHomeRow: boolean;
  /** Shown as the seasonal banner instead of a grid tile. */
  featured?: boolean;
}

export interface CategoryWithCount extends Category {
  offerCount: number;
}

export interface Area {
  slug: string;
  name: string;
}

export interface AreaWithCount extends Area {
  /** Live offers in this area. */
  offerCount: number;
}

export type OfferType = "percent" | "flat" | "bogo" | "combo" | "other";

export interface OfferStep {
  text: string;
}

export type RedemptionMode = "walk_in" | "shared_code" | "unique_claim";

export interface Offer {
  /** The API's id (UUID). */
  id: string;
  /** URL handle: "<slug>-<id>". */
  slug: string;
  title: string;
  badge: string;
  type: OfferType;
  /** Approximate discount in percent, used for sorting. */
  discount: number;
  categorySlug: string;
  subcategory?: string;
  businessSlug: string;
  businessName: string;
  areaSlug: string;
  areaName: string;
  images: string[];
  /** One-line offer summary shown in the details list. */
  offerText: string;
  validFrom: string;
  validTo: string;
  createdAt: string;
  timings: string;
  address: string;
  steps: OfferStep[];
  terms: string[];
  redemptionMode: RedemptionMode;
  /** Derived from validTo at read time. */
  isExpired: boolean;
  daysLeft: number;
  /** Km to the shop's nearest outlet; only on lists read with the visitor's location. */
  distanceKm?: number;
  /** Smallest bill (₹) the offer applies to. */
  minSpend?: number;
  /** `images[0]` is the shop's logo standing in for a missing offer photo, so show it whole. */
  imageIsLogo?: boolean;
  /** Branches the offer is valid at ("Main branch, Yagnik Road"), when the shop lists more than its main one. */
  validAt: string[];
  /** Where to send directions: the offer's branch when it is not valid at the main one. */
  geo?: { lat: number; lng: number };
}

/** The fields an offer card needs. */
export type OfferSummary = Pick<
  Offer,
  | "id"
  | "slug"
  | "title"
  | "badge"
  | "businessName"
  | "areaName"
  | "images"
  | "validTo"
  | "isExpired"
  | "daysLeft"
  | "distanceKm"
  | "minSpend"
  | "imageIsLogo"
>;

export interface OpeningHours {
  /** 0 = Monday … 6 = Sunday. */
  day: number;
  /** 24h "HH:MM", or null when closed all day. */
  opens: string | null;
  closes: string | null;
}

export interface Business {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  areaSlug: string;
  areaName: string;
  cover: string;
  about: string;
  /** Full one-line address for display. */
  address: string;
  /** Street part only ("12, Sample Complex, Kalawad Road"), for structured data. */
  streetAddress: string;
  postalCode: string;
  /** Masked ("+9198••••••02") until a signed-in visitor reveals them. */
  phone: string;
  whatsapp: string;
  contactMasked: boolean;
  instagram?: string;
  website?: string;
  hours: OpeningHours[];
  photos: string[];
  geo: { lat: number; lng: number };
}

export type SortKey = "newest" | "ending" | "discount" | "nearest";
export type ValidityKey = "today" | "week" | "month";

export interface OfferFilters {
  q?: string;
  category?: string;
  subcategory?: string;
  areas?: string[];
  type?: OfferType;
  validity?: ValidityKey;
  sort?: SortKey;
  page?: number;
  /** The visitor's location (from the location cookie, never the URL). */
  near?: { lat: number; lng: number };
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

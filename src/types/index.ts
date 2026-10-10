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
  subcategories: string[];
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

export interface Offer {
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
  /** Derived from validTo at read time. */
  isExpired: boolean;
  daysLeft: number;
}

/** The fields an offer card needs. */
export type OfferSummary = Pick<
  Offer,
  | "slug"
  | "title"
  | "badge"
  | "businessName"
  | "areaName"
  | "images"
  | "validTo"
  | "isExpired"
  | "daysLeft"
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
  phone: string;
  whatsapp: string;
  instagram?: string;
  website?: string;
  hours: OpeningHours[];
  photos: string[];
  geo: { lat: number; lng: number };
}

export type SortKey = "newest" | "ending" | "discount";
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
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

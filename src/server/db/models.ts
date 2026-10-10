import type { ObjectId } from "mongodb";
import type { CategoryIcon, OfferType, OpeningHours } from "@/types";
import { getDb } from "./client";

/**
 * Document shapes as stored in MongoDB. Services turn these into the domain
 * types in `@/types`; nothing outside `src/server` should see them.
 */

/** Text shown to visitors, per language. English is always present. */
export interface I18n {
  en: string;
  gu?: string;
}

interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface AreaDoc extends Timestamps {
  _id?: ObjectId;
  slug: string;
  name: I18n;
  city: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryDoc extends Timestamps {
  _id?: ObjectId;
  slug: string;
  name: I18n;
  shortName: I18n;
  icon: CategoryIcon;
  image: string;
  description: I18n;
  /** `value` is the English name; it is also the `sub` filter value in URLs. */
  subcategories: { value: string; name: I18n }[];
  inHomeRow: boolean;
  featured: boolean;
  sortOrder: number;
  isActive: boolean;
}

export type BusinessStatus = "pending" | "active" | "suspended";

export interface BusinessDoc extends Timestamps {
  _id?: ObjectId;
  slug: string;
  name: string;
  categorySlug: string;
  areaSlug: string;
  about: I18n;
  /** Street part, e.g. "12, Sample Complex, Kalawad Road". */
  addressLine: string;
  postalCode: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  website?: string;
  hours: OpeningHours[];
  cover: string;
  photos: string[];
  geo: { type: "Point"; coordinates: [lng: number, lat: number] };
  ownerIds: ObjectId[];
  status: BusinessStatus;
  verified: boolean;
  plan: "free";
  sortOrder: number;
}

export type OfferStatus = "draft" | "pending" | "approved" | "rejected" | "paused" | "expired" | "archived";

export interface OfferDoc extends Timestamps {
  _id?: ObjectId;
  slug: string;
  businessId: ObjectId;
  title: I18n;
  badge: I18n;
  type: OfferType;
  /** Approximate discount in percent, used for sorting. */
  discount: number;
  categorySlug: string;
  subcategory?: string;
  offerText?: I18n;
  images: string[];
  /** Calendar days in Asia/Kolkata, "YYYY-MM-DD". */
  validFrom: string;
  validTo: string;
  timings: I18n;
  steps: { text: I18n }[];
  terms: I18n[];
  status: OfferStatus;
  featured: boolean;
  publishedAt?: Date;
  /** Copied from the business so lists never need a join; re-synced when the business changes. */
  businessSlug: string;
  businessName: string;
  areaSlug: string;
  areaName: I18n;
  address: I18n;
  sortOrder: number;
}

export async function collections() {
  const db = await getDb();
  return {
    areas: db.collection<AreaDoc>("areas"),
    categories: db.collection<CategoryDoc>("categories"),
    businesses: db.collection<BusinessDoc>("businesses"),
    offers: db.collection<OfferDoc>("offers"),
  };
}

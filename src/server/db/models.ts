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
  verifiedAt?: Date;
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
  rejectionReason?: string;
  featured: boolean;
  publishedAt?: Date;
  createdBy?: ObjectId;
  /** Copied from the business so lists never need a join; re-synced when the business changes. */
  businessSlug: string;
  businessName: string;
  areaSlug: string;
  areaName: I18n;
  address: I18n;
  sortOrder: number;
}

export type Role = "user" | "business" | "admin" | "superadmin";

export interface UserDoc extends Timestamps {
  _id?: ObjectId;
  /** E.164 without spaces: "+919876543210". */
  mobile: string;
  name?: string;
  email?: string;
  role: Role;
  businessIds: ObjectId[];
  locale: "en" | "gu";
  status: "active" | "blocked";
  lastLoginAt?: Date;
}

export interface OtpDoc {
  _id?: ObjectId;
  mobile: string;
  codeHash: string;
  attempts: number;
  ip: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
}

export interface SessionDoc {
  _id?: ObjectId;
  userId: ObjectId;
  /** Hash of the current refresh secret; an older secret presented again means the token was stolen. */
  refreshTokenHash: string;
  previousRefreshTokenHash?: string;
  rotatedAt?: Date;
  userAgent: string;
  ip: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
}

export type SubmissionStatus = "new" | "in_review" | "converted" | "rejected" | "spam";

export interface SubmissionDoc extends Timestamps {
  _id?: ObjectId;
  businessName: string;
  categorySlug: string;
  areaSlug: string;
  address: string;
  ownerName: string;
  mobile: string;
  whatsappSame: boolean;
  instagram?: string;
  title: string;
  type: OfferType;
  description: string;
  terms?: string;
  startDate: string;
  endDate: string;
  mediaIds: ObjectId[];
  /** Copied from the media records so the inbox can show photos without a lookup. */
  images: string[];
  userId?: ObjectId;
  ip: string;
  status: SubmissionStatus;
  reason?: string;
  convertedOfferId?: ObjectId;
  convertedBusinessId?: ObjectId;
  notes?: string;
}

export interface ContactDoc extends Timestamps {
  _id?: ObjectId;
  name: string;
  mobile: string;
  subject: string;
  message: string;
  userId?: ObjectId;
  ip: string;
  status: "new" | "replied" | "closed";
  note?: string;
}

export type ReportReason = "expired" | "wrong_info" | "not_honoured" | "offensive" | "other";

export interface ReportDoc extends Timestamps {
  _id?: ObjectId;
  offerId: ObjectId;
  offerSlug: string;
  reason: ReportReason;
  details?: string;
  mobile?: string;
  userId?: ObjectId;
  ip: string;
  status: "open" | "actioned" | "dismissed";
  note?: string;
}

export type MediaPurpose = "submission" | "offer" | "business_cover" | "business_photo" | "category";

export interface MediaDoc {
  _id?: ObjectId;
  key: string;
  url: string;
  mime: string;
  bytes: number;
  purpose: MediaPurpose;
  status: "pending" | "ready";
  ownerId?: ObjectId;
  createdAt: Date;
}

export interface AuditDoc {
  _id?: ObjectId;
  actorId: ObjectId;
  actorMobile: string;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  createdAt: Date;
}

export interface RateLimitDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

export async function collections() {
  const db = await getDb();
  return {
    areas: db.collection<AreaDoc>("areas"),
    categories: db.collection<CategoryDoc>("categories"),
    businesses: db.collection<BusinessDoc>("businesses"),
    offers: db.collection<OfferDoc>("offers"),
    users: db.collection<UserDoc>("users"),
    otpCodes: db.collection<OtpDoc>("otp_codes"),
    sessions: db.collection<SessionDoc>("sessions"),
    submissions: db.collection<SubmissionDoc>("offer_submissions"),
    contactMessages: db.collection<ContactDoc>("contact_messages"),
    reports: db.collection<ReportDoc>("offer_reports"),
    media: db.collection<MediaDoc>("media"),
    auditLogs: db.collection<AuditDoc>("audit_logs"),
    rateLimits: db.collection<RateLimitDoc>("rate_limits"),
  };
}

import { z } from "zod";

/** Input schemas for admin writes. Shared by the /api/v1/admin routes and the admin panel's server actions. */

export const objectId = z.string().regex(/^[a-f0-9]{24}$/, "Unknown id");
const slug = z.string().trim().min(1).max(60).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only");
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM");
const blankToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);
const optionalString = (max: number) => z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

/** An image we can show: an https URL, or a development upload served by this app. */
export const imageUrl = z
  .string()
  .trim()
  .refine((v) => /^https:\/\/\S+$/.test(v) || v.startsWith("/api/v1/media/"), "Use an https image URL or upload a photo");

/** Text in English (required) and Gujarati (optional). */
export const i18nText = (max: number) => z.object({ en: z.string().trim().min(1, "Required").max(max), gu: optionalString(max) });

/** Text that may be left empty in both languages. */
const optionalI18n = (max: number) =>
  z
    .object({ en: z.string().trim().max(max), gu: optionalString(max) })
    .optional()
    .transform((v) => (v?.en ? { en: v.en, ...(v.gu && { gu: v.gu }) } : undefined));

export const offerType = z.enum(["percent", "flat", "bogo", "combo", "other"]);

export const offerInput = z
  .object({
    businessId: objectId,
    title: i18nText(80),
    badge: i18nText(24),
    type: offerType,
    discount: z.coerce.number().int().min(0).max(100),
    categorySlug: slug,
    subcategory: optionalString(60),
    offerText: optionalI18n(200),
    images: z.array(imageUrl).min(1, "Add at least one photo").max(5, "Up to 5 photos"),
    validFrom: isoDay,
    validTo: isoDay,
    timings: i18nText(60),
    steps: z.array(i18nText(160)).max(8),
    terms: z.array(i18nText(300)).max(12),
    featured: z.boolean().default(false),
  })
  .refine((v) => v.validTo >= v.validFrom, { path: ["validTo"], message: "Must be on or after the start date" });

export type OfferInput = z.infer<typeof offerInput>;

const phone = z.string().trim().regex(/^\+?[\d\s-]{7,18}$/, "Enter a phone number");

export const openingHours = z
  .array(
    z
      .object({ day: z.number().int().min(0).max(6), opens: time.nullable(), closes: time.nullable() })
      .refine((h) => (h.opens === null) === (h.closes === null), "Set both times or mark the day closed")
      .refine((h) => !h.opens || !h.closes || h.closes > h.opens, "Closing time must be after opening time"),
  )
  .length(7);

export const businessInput = z.object({
  name: z.string().trim().min(1).max(120),
  categorySlug: slug,
  areaSlug: slug,
  about: i18nText(1000),
  addressLine: z.string().trim().min(1).max(200),
  postalCode: z.string().trim().regex(/^\d{6}$/, "6-digit PIN code"),
  phone,
  whatsapp: phone,
  instagram: z.preprocess(blankToUndefined, z.string().trim().regex(/^@?[\w.]{1,30}$/, "Enter a valid Instagram handle").optional()),
  website: z.preprocess(blankToUndefined, z.url().optional()),
  hours: openingHours,
  cover: imageUrl,
  photos: z.array(imageUrl).max(12),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export type BusinessInput = z.infer<typeof businessInput>;

export const categoryIcon = z.enum(["utensils", "shirt", "scissors", "smartphone", "dumbbell", "sofa", "wrench", "gift", "ticket"]);

export const categoryInput = z.object({
  slug,
  name: i18nText(60),
  shortName: i18nText(24),
  icon: categoryIcon,
  image: imageUrl,
  description: i18nText(200),
  subcategories: z.array(z.object({ value: z.string().trim().min(1).max(40), name: i18nText(40) })).max(20),
  inHomeRow: z.boolean(),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(1000),
  isActive: z.boolean(),
});

export type CategoryInput = z.infer<typeof categoryInput>;

export const areaInput = z.object({
  slug,
  name: i18nText(60),
  sortOrder: z.coerce.number().int().min(0).max(1000),
  isActive: z.boolean(),
});

export type AreaInput = z.infer<typeof areaInput>;

export const reasonInput = z.object({ reason: z.string().trim().min(1, "Give a reason").max(500) });

export const submissionRejectInput = reasonInput.extend({ spam: z.boolean().default(false) });

export const convertInput = z.object({
  /** "new" creates a business from the submission; otherwise the id of an existing business. */
  business: z.union([z.literal("new"), objectId]),
  badge: z.string().trim().min(1, "Required").max(24),
  discount: z.coerce.number().int().min(0).max(100),
  publish: z.boolean().default(false),
});

export type ConvertInput = z.infer<typeof convertInput>;

export const userUpdateInput = z.object({
  role: z.enum(["user", "business", "admin", "superadmin"]).optional(),
  status: z.enum(["active", "blocked"]).optional(),
  name: optionalString(80),
});

export const addUserInput = z.object({
  mobile: z.string().trim().min(10),
  name: optionalString(80),
  role: z.enum(["admin", "superadmin"]),
});

export const contactUpdateInput = z.object({
  status: z.enum(["new", "replied", "closed"]).optional(),
  note: optionalString(1000),
});

export const reportResolveInput = z.object({
  status: z.enum(["actioned", "dismissed"]),
  note: optionalString(1000),
});

export const featuredInput = z.object({ featured: z.boolean() });
export const verifiedInput = z.object({ verified: z.boolean() });
export const businessStatusInput = z.object({ status: z.enum(["active", "suspended"]) });

export const listQuery = z.object({
  q: z.preprocess(blankToUndefined, z.string().trim().max(100).optional()),
  status: z.preprocess(blankToUndefined, z.string().max(30).optional()),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type ListQuery = z.infer<typeof listQuery>;

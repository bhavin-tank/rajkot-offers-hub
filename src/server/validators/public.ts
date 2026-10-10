import { z } from "zod";
import { locales } from "@/lib/i18n/config";

/** Query and body schemas for the public API. Names match the website's URL filters (src/lib/filters.ts). */

export const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 9;

const slug = z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Must be a lowercase slug");

export const lang = z.enum(locales).default("en");

export const langQuery = z.object({ lang });

export const limitQuery = (fallback: number) =>
  z.object({ lang, limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(fallback) });

export const offerListQuery = z.object({
  lang,
  q: z.string().trim().max(100).optional(),
  category: slug.optional(),
  sub: z.string().trim().max(60).optional(),
  areas: z
    .string()
    .transform((value) => value.split(",").map((s) => s.trim()).filter(Boolean))
    .pipe(z.array(slug).max(20))
    .optional(),
  type: z.enum(["percent", "flat", "bogo", "combo", "other"]).optional(),
  validity: z.enum(["today", "week", "month"]).optional(),
  sort: z.enum(["newest", "ending", "discount"]).default("newest"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export const categoryListQuery = z.object({ lang, area: slug.optional() });

export const areaListQuery = z.object({
  lang,
  withCounts: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export const offerBatchBody = z.object({ slugs: z.array(slug).max(100) });

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const mobileField = z.string().trim().refine((v) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "")), "Enter a valid mobile number");
const objectId = z.string().regex(/^[a-f0-9]{24}$/, "Unknown id");

/** Same rules as the submit-offer form (src/lib/validation/forms.ts). */
export const submissionBody = z
  .object({
    businessName: z.string().trim().min(1).max(120),
    category: slug,
    area: slug,
    address: z.string().trim().min(1).max(300),
    ownerName: z.string().trim().min(1).max(80),
    mobile: mobileField,
    whatsapp: z.boolean().default(true),
    instagram: z
      .string()
      .trim()
      .regex(/^@?[\w.]{1,30}$/, "Enter a valid Instagram handle")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    title: z.string().trim().min(1).max(80),
    type: z.enum(["percent", "flat", "bogo", "combo", "other"]),
    description: z.string().trim().min(1).max(2000),
    terms: z.string().trim().max(2000).optional(),
    startDate: isoDay,
    endDate: isoDay,
    mediaIds: z.array(objectId).max(5).default([]),
    confirm: z.literal(true, { error: "Please confirm to continue" }),
  })
  .refine((v) => v.endDate >= v.startDate, { path: ["endDate"], message: "The end date must be after the start date" });

export type SubmissionBody = z.infer<typeof submissionBody>;

export const contactBody = z.object({
  name: z.string().trim().min(1).max(80),
  mobile: mobileField,
  subject: z.enum(["General question", "Complaint about an offer", "Listing an offer", "Suggestion"]),
  message: z.string().trim().min(1).max(2000),
});

export type ContactBody = z.infer<typeof contactBody>;

export const reportBody = z.object({
  reason: z.enum(["expired", "wrong_info", "not_honoured", "offensive", "other"]),
  details: z.string().trim().max(1000).optional(),
  mobile: mobileField.optional(),
});

export type ReportBody = z.infer<typeof reportBody>;

export const uploadBody = z.object({
  mime: z.string(),
  bytes: z.number().int().positive(),
});

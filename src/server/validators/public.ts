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

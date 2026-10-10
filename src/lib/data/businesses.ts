import type { Locale } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { findBusiness } from "@/server/services/businesses";
import type { Business } from "@/types";
import { cacheFor, getSlugs, TAGS } from "./cache";

export async function businessFor(locale: Locale, slug: string): Promise<Business | undefined> {
  "use cache";
  cacheFor(TAGS.businesses, TAGS.catalog);
  return findBusiness(slug, locale);
}

export async function getBusiness(slug: string): Promise<Business | undefined> {
  return businessFor(await getLocale(), slug);
}

export async function getBusinessSlugs() {
  return (await getSlugs()).businesses;
}

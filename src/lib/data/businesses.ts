import type { Business } from "@/types";
import { getLocale } from "@/lib/i18n/server";
import { buildBusinesses } from "./catalog";

export async function getBusiness(slug: string): Promise<Business | undefined> {
  return buildBusinesses(await getLocale()).find((b) => b.slug === slug);
}

export function getBusinessSlugs() {
  return buildBusinesses("en").map((b) => b.slug);
}

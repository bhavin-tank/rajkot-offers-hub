import type { Business } from "@/types";
import { buildBusinesses } from "./catalog";

export async function getBusiness(slug: string): Promise<Business | undefined> {
  return buildBusinesses().find((b) => b.slug === slug);
}

export function getBusinessSlugs() {
  return buildBusinesses().map((b) => b.slug);
}

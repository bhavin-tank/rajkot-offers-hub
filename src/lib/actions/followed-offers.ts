"use server";

import { api } from "@/lib/api/client";
import { toOfferSummary } from "@/lib/api/mappers";
import type { Page, PromotionCard } from "@/lib/api/types";
import { withSession } from "@/lib/auth/session";
import type { OfferSummary } from "@/types";

const LIMIT = 12;

/**
 * The newest live offers of the shops the signed-in visitor follows; empty for a guest or when there are none.
 * `follows` are the shop slugs they follow: an API that does not know `followed` yet answers with the whole feed,
 * so the cards are narrowed to those shops here as well.
 */
export async function followedOffersAction(follows: string[]): Promise<OfferSummary[]> {
  if (!Array.isArray(follows) || !follows.length) return [];
  const slugs = new Set(follows.filter((slug) => typeof slug === "string"));
  try {
    const page = await withSession((token) =>
      api<Page<PromotionCard>>("/promotions", { query: { followed: true, sort: "latest", per_page: LIMIT }, token, client: null }),
    );
    return page === "signed-out" ? [] : page.data.filter((card) => slugs.has(card.business.slug)).map(toOfferSummary);
  } catch (error) {
    console.error("[followed-offers]", error);
    return [];
  }
}

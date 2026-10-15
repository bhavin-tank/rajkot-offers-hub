import { api, orUndefined } from "@/lib/api/client";
import { toReview } from "@/lib/api/mappers";
import type { Page, ReviewResource } from "@/lib/api/types";
import type { Outlet, Review } from "@/types";

const RECENT = 5;

/** The newest approved reviews of an offer, and how many it has in all. */
export async function getOfferReviews(offerId: string): Promise<{ items: Review[]; total: number }> {
  const page = await orUndefined(api<Page<ReviewResource>>(`/promotions/${offerId}/reviews`, { query: { per_page: RECENT } }));
  return { items: page?.data.map((r) => toReview(r)) ?? [], total: page?.meta.total ?? 0 };
}

/** The newest approved reviews of a shop; each names its outlet when the shop has several. */
export async function getBusinessReviews(businessId: string, outlets: Outlet[]): Promise<{ items: Review[]; total: number }> {
  const page = await orUndefined(api<Page<ReviewResource>>(`/businesses/${businessId}/reviews`, { query: { per_page: RECENT } }));
  return { items: page?.data.map((r) => toReview(r, outlets)) ?? [], total: page?.meta.total ?? 0 };
}

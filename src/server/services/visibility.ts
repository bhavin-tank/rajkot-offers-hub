import type { Filter } from "mongodb";
import type { OfferDoc, OfferStatus } from "../db/models";

/**
 * What the public site may show. An offer is "live" once approved, from its
 * first day to its last day (inclusive, Rajkot dates). Past offers stay
 * reachable by URL so old links and saved offers still open.
 */
export const PUBLIC_OFFER_STATUSES: OfferStatus[] = ["approved", "expired"];

export function liveOfferFilter(today: string): Filter<OfferDoc> {
  return { status: "approved", validFrom: { $lte: today }, validTo: { $gte: today } };
}

export function publicOfferFilter(): Filter<OfferDoc> {
  return { status: { $in: PUBLIC_OFFER_STATUSES } };
}

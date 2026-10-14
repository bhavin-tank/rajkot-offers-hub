"use server";

import { getOffersByHandles } from "@/lib/data";
import type { OfferSummary } from "@/types";

/** Cards for the offers saved in this browser (by handle), so the saved page shows them live or expired. */
export async function savedOfferCards(handles: string[]): Promise<OfferSummary[]> {
  const clean = handles.filter((h) => typeof h === "string" && h.length <= 200).slice(0, 60);
  return clean.length ? getOffersByHandles(clean) : [];
}

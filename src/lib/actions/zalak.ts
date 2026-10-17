"use server";

import { getZalakFeed } from "@/lib/zalak/data";
import type { ZalakStory } from "@/lib/zalak/types";

/** The next reels of the Zalak feed, for the infinite scroll. An empty list means the feed has ended; a failure also ends it quietly. */
export async function moreReelsAction(offset: number, limit = 6): Promise<ZalakStory[]> {
  if (!Number.isInteger(offset) || offset < 0 || limit < 1 || limit > 24) return [];
  try {
    return await getZalakFeed(limit, offset);
  } catch {
    return [];
  }
}

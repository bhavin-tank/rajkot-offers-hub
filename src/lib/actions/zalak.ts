"use server";

import { api, ApiError } from "@/lib/api/client";
import { deviceHeaders } from "@/lib/api/device";
import { accessToken, withSession } from "@/lib/auth/session";
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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Tells the API which statuses or reels were actually on screen, so a ring goes grey and a reel is not served again. Never throws: a missed report is only a missed grey ring. */
export async function reportSeenAction(type: "status" | "reel", ids: string[]): Promise<void> {
  if ((type !== "status" && type !== "reel") || !Array.isArray(ids)) return;
  const clean = [...new Set(ids.filter((id) => typeof id === "string" && UUID.test(id)))].slice(0, 50);
  if (clean.length === 0) return;
  try {
    await api("/feed-views", { method: "POST", body: { type, ids: clean }, token: await accessToken(), headers: await deviceHeaders(), client: null });
  } catch (error) {
    // 422 is a guest with no device key yet, 404 a platform with the feature off: nothing to report either way.
    if (!(error instanceof ApiError) || error.status >= 500) console.error("[feed-views]", error);
  }
}

/** Likes or unlikes a status or a reel. "signed-out" means the visitor has to log in first. */
export async function setLikeAction(kind: "status" | "reel", id: string, liked: boolean): Promise<"ok" | "signed-out" | "error"> {
  if ((kind !== "status" && kind !== "reel") || typeof id !== "string" || !UUID.test(id)) return "error";
  const path = `/${kind === "status" ? "statuses" : "reels"}/${id}/like`;
  try {
    const result = await withSession((token) => api(path, { method: liked ? "POST" : "DELETE", token, client: null }));
    return result === "signed-out" ? "signed-out" : "ok";
  } catch (error) {
    // Unliking something that has since gone is already what was asked for.
    if (!liked && error instanceof ApiError && error.status === 404) return "ok";
    console.error("[like]", error);
    return "error";
  }
}

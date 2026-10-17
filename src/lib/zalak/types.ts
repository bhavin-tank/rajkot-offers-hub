/** A clip is 5 to 15 seconds: a short video, or a photo shown for that long. */
export const CLIP_MIN_SECONDS = 5;
export const CLIP_MAX_SECONDS = 15;

/** Zalak is the feed of reels; a status is a shop's post that disappears after 24 hours. Both play in the same viewer. */
export type ZalakKind = "reel" | "status";

export interface ZalakClip {
  kind: "image" | "video";
  /** The photo, or the video file. */
  src: string;
  /** A still shown before a video plays. */
  poster?: string;
  /** How long it plays, between CLIP_MIN_SECONDS and CLIP_MAX_SECONDS. */
  seconds: number;
}

export interface ZalakShop {
  slug: string;
  name: string;
  logo?: string;
  areaName: string;
}

/** One reel, or one shop's status: a shop, a short caption and one or more clips (the "angles"). */
export interface ZalakStory {
  id: string;
  kind: ZalakKind;
  shop: ZalakShop;
  title: string;
  caption?: string;
  /** The offer the "View offer" button opens, when the post is about one. */
  offer?: { slug: string; urlSlug: string; businessSlug: string };
  /** Km from the visitor to the shop's nearest outlet, when they have shared a location. */
  distanceKm?: number;
  /** ISO time it was posted. */
  postedAt: string;
  /** ISO time a status disappears. */
  expiresAt?: string;
  clips: ZalakClip[];
}

export function totalSeconds(story: Pick<ZalakStory, "clips">) {
  return story.clips.reduce((sum, clip) => sum + clip.seconds, 0);
}

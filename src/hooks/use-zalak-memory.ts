import { useSyncExternalStore } from "react";

/**
 * What this browser remembers about Zalak: which statuses it has watched (the ring on the home page turns
 * grey), which reels it liked, and whether it has seen the swipe tour. Kept in localStorage, never sent anywhere.
 */

const SEEN_KEY = "zalak-seen";
const LIKED_KEY = "zalak-liked";
const TOUR_KEY = "zalak-tour";
const CHANGED = "zalak-memory";

function read(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the memory just does not stick.
  }
  window.dispatchEvent(new Event(CHANGED));
}

function subscribe(listener: () => void) {
  window.addEventListener(CHANGED, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGED, listener);
    window.removeEventListener("storage", listener);
  };
}

function useKey(key: string, server = "") {
  return useSyncExternalStore(subscribe, () => read(key), () => server);
}

const split = (raw: string) => new Set(raw ? raw.split(",") : []);

/** Ids of the statuses that were watched. */
export function useSeenStatuses() {
  return split(useKey(SEEN_KEY));
}

export function markStatusSeen(id: string) {
  const seen = split(read(SEEN_KEY));
  if (seen.has(id)) return;
  seen.add(id);
  write(SEEN_KEY, [...seen].slice(-100).join(","));
}

export function useLikedStories() {
  const liked = split(useKey(LIKED_KEY));
  return {
    isLiked: (id: string) => liked.has(id),
    toggle(id: string) {
      const next = split(read(LIKED_KEY));
      if (!next.delete(id)) next.add(id);
      write(LIKED_KEY, [...next].join(","));
    },
  };
}

/** True until the tour for this viewer (reels or statuses) was shown once on this device. The server never shows it, so a returning visitor sees no flash. */
export function useTourPending(kind: "reel" | "status") {
  return useKey(`${TOUR_KEY}-${kind}`, "done") !== "done";
}

export function markTourDone(kind: "reel" | "status") {
  write(`${TOUR_KEY}-${kind}`, "done");
}

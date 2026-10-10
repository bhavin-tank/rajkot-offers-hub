"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Saved offers live only in this browser (localStorage), as the design
 * says. The store is shared by every component through one subscription.
 */
const KEY = "rajkot-offers:saved";
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: string[] = EMPTY;

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cachedValue;
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedValue = Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : EMPTY;
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

function write(next: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked (private mode); keep the in-memory value.
    cachedValue = next;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedOffers() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY);

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved]);

  const toggle = useCallback((slug: string) => {
    const current = read();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current];
    write(next);
    return next.includes(slug);
  }, []);

  const remove = useCallback((slug: string) => write(read().filter((s) => s !== slug)), []);

  /** Puts a removed slug back at its old position (undo). */
  const restore = useCallback((slug: string, index: number) => {
    const current = read().filter((s) => s !== slug);
    current.splice(Math.min(index, current.length), 0, slug);
    write(current);
  }, []);

  return { saved, isSaved, toggle, remove, restore };
}

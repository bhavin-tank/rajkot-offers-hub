import { api } from "@/lib/api/client";
import { offerIdFromHandle } from "@/lib/api/mappers";
import type { AreaCount, CategoryChip } from "@/lib/api/types";

/**
 * Detail pages look up their slug inside <Suspense>, so by the time they call
 * notFound() the 200 status has already been sent ("soft 404"). The proxy asks
 * this first and answers unknown URLs with a real 404.
 *
 * Categories and areas are short lists, kept in memory for a minute. Offer URLs
 * are checked for shape only (they carry the offer's id); a shop that does not
 * exist still falls back to the page's own not-found state.
 */
const TTL_MS = 60_000;

interface Known {
  areas: Set<string>;
  categories: Set<string>;
}

let cached: { known: Promise<Known>; loadedAt: number } | undefined;

function known() {
  if (!cached || Date.now() - cached.loadedAt > TTL_MS) {
    const loading = Promise.all([
      api<{ data: AreaCount[] }>("/promotions/areas"),
      api<{ data: CategoryChip[] }>("/promotions/categories"),
    ]).then(([areas, categories]) => ({
      areas: new Set(areas.data.map((a) => a.slug)),
      categories: new Set(categories.data.map((c) => c.slug)),
    }));
    cached = { known: loading, loadedAt: Date.now() };
    loading.catch(() => (cached = undefined));
  }
  return cached.known;
}

/** Top-level pages; any other first segment is an area. */
const PAGES = new Set(["offers", "categories", "contact", "how-it-works", "saved", "submit-offer", "login", "account", "businesses", "privacy", "terms"]);

/**
 * Whether `path` (without locale prefix) names an offer, category or area that
 * does not exist. When the API can't be reached it answers false and leaves the
 * page to show its own not-found state.
 */
export async function hasUnknownSlug(path: string) {
  const [first, second, third] = path.split("/").slice(1);
  if (!first) return false;
  if (first === "offers" && second !== undefined && offerIdFromHandle(second)) return false;
  if (PAGES.has(first) && first !== "offers" && first !== "categories") return false;
  try {
    const { areas, categories } = await known();
    if (first === "offers") return second !== undefined && !categories.has(second);
    if (first === "categories") return second !== undefined && !categories.has(second);
    if (!areas.has(first)) return true;
    return (second === "offers" || second === "categories") && third !== undefined && !categories.has(third);
  } catch (error) {
    console.error("Slug lookup failed", error);
    return false;
  }
}

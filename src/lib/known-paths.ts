import { api, ApiError } from "@/lib/api/client";
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

let cached: { known: Known; loadedAt: number } | undefined;

/**
 * Keeps the lists, never a load in progress: on Cloudflare Workers a promise one request
 * started cannot settle inside another, so requests sharing an in-flight load were cancelled
 * as hung. Requests that find nothing fresh each load for themselves.
 */
async function known(): Promise<Known> {
  if (cached && Date.now() - cached.loadedAt <= TTL_MS) return cached.known;
  const [areas, categories] = await Promise.all([
    api<{ data: AreaCount[] }>("/promotions/areas"),
    api<{ data: CategoryChip[] }>("/promotions/categories"),
  ]);
  const lists = {
    areas: new Set(areas.data.map((a) => a.slug)),
    categories: new Set(categories.data.map((c) => c.slug)),
  };
  cached = { known: lists, loadedAt: Date.now() };
  return lists;
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

/** Whether a shop exists, remembered for a minute (positive and negative answers alike) so a busy URL costs one lookup. */
const shops = new Map<string, { exists: boolean; at: number }>();

async function shopExists(slug: string) {
  const hit = shops.get(slug);
  if (hit && Date.now() - hit.at <= TTL_MS) return hit.exists;
  try {
    await api<unknown>(`/businesses/${encodeURIComponent(slug)}`);
    if (shops.size > 1000) shops.clear();
    shops.set(slug, { exists: true, at: Date.now() });
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      if (shops.size > 1000) shops.clear();
      shops.set(slug, { exists: false, at: Date.now() });
      return false;
    }
    throw error;
  }
}

/** What the proxy does with a shop or offer URL: serve another path under this URL, or send the visitor to a new one. */
export type ShopRoute = { kind: "rewrite" | "redirect"; path: string };

/**
 * Shops live at "/<shop>" and their offers at "/<shop>/<offer>". Those URLs are served by the
 * "/businesses/<shop>" and "/offers/<offer>" pages, and the old addresses of both are sent
 * to the new ones. Areas and the site's own pages keep the first segment; anything else is
 * a shop when the API knows it. Null means this is not a shop or offer URL.
 */
export async function shopRoute(path: string): Promise<ShopRoute | null> {
  const [first, second, third] = path.split("/").slice(1);
  if (!first) return null;

  if (first === "businesses" && second && third === undefined) return { kind: "redirect", path: `/${second}` };

  if (first === "offers") {
    const id = second && third === undefined ? offerIdFromHandle(second) : null;
    if (!id) return null;
    try {
      const { data } = await api<{ data: { business: { slug: string } } }>(`/promotions/${id}`);
      return { kind: "redirect", path: `/${data.business.slug}/${second}` };
    } catch (error) {
      // Unknown or unreachable: the offer page shows its own not-found state.
      if (!(error instanceof ApiError && error.status === 404)) console.error("Offer lookup failed", error);
      return null;
    }
  }

  if (PAGES.has(first) || third !== undefined) return null;
  const offer = second !== undefined;
  if (offer && !offerIdFromHandle(second)) return null;
  try {
    if ((await known()).areas.has(first)) return null;
    if (!(await shopExists(first))) return null;
  } catch (error) {
    console.error("Shop lookup failed", error);
    return null;
  }
  return { kind: "rewrite", path: offer ? `/offers/${second}` : `/businesses/${first}` };
}

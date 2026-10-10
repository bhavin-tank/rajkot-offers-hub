import { findSlugs } from "@/server/services/slugs";

/**
 * Detail pages look up their slug inside <Suspense>, so by the time they call
 * notFound() the 200 status has already been sent ("soft 404"). The proxy asks
 * this first and answers unknown slugs with a real 404.
 *
 * The proxy runs before the page cache, so the slug sets are kept in memory
 * for a minute instead of reading MongoDB on every request.
 */
const TTL_MS = 60_000;

interface KnownSlugs {
  areas: Set<string>;
  businesses: Set<string>;
  categories: Set<string>;
  offers: Set<string>;
}

let cached: { slugs: Promise<KnownSlugs>; expires: number } | undefined;

function knownSlugs() {
  if (!cached || cached.expires < Date.now()) {
    const slugs = findSlugs().then((s) => ({
      areas: new Set(s.areas),
      businesses: new Set(s.businesses),
      categories: new Set(s.categories),
      offers: new Set(s.offers),
    }));
    cached = { slugs, expires: Date.now() + TTL_MS };
    // Don't keep a failed lookup for the whole minute.
    slugs.catch(() => (cached = undefined));
  }
  return cached.slugs;
}

/** Top-level pages; any other first segment is an area. */
const PAGES = new Set(["offers", "categories", "contact", "how-it-works", "saved", "submit-offer"]);

/**
 * Whether `path` (without locale prefix) names a business, offer, category or
 * area that does not exist. When the database can't be reached it answers
 * false and leaves the page to show its own not-found state.
 */
export async function hasUnknownSlug(path: string) {
  const [first, second, third] = path.split("/").slice(1);
  if (!first || (PAGES.has(first) && first !== "offers" && first !== "categories")) return false;

  let known: KnownSlugs;
  try {
    known = await knownSlugs();
  } catch (error) {
    console.error("Slug lookup failed", error);
    return false;
  }
  const { areas, businesses, categories, offers } = known;

  if (first === "businesses") return second !== undefined && !businesses.has(second);
  if (first === "offers") return second !== undefined && !categories.has(second) && !offers.has(second);
  if (first === "categories") return second !== undefined && !categories.has(second);
  if (!areas.has(first)) return true;
  return (second === "offers" || second === "categories") && third !== undefined && !categories.has(third);
}

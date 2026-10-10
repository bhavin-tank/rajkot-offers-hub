import { areas } from "@/lib/mock/areas";
import { businesses } from "@/lib/mock/businesses";
import { categories } from "@/lib/mock/categories";
import { offers } from "@/lib/mock/offers";

/**
 * Detail pages look up their slug inside <Suspense>, so by the time they call
 * notFound() the 200 status has already been sent ("soft 404"). The proxy asks
 * this first and answers unknown slugs with a real 404. A real API needs a cheap
 * slug lookup here too.
 */
const AREAS = new Set(areas.map((a) => a.slug));
const BUSINESSES = new Set(businesses.map((b) => b.slug));
const CATEGORIES = new Set(categories.map((c) => c.slug));
const OFFERS = new Set(offers.map((o) => o.slug));

/** Top-level pages; any other first segment is an area. */
const PAGES = new Set(["offers", "categories", "contact", "how-it-works", "saved", "submit-offer"]);

/** Whether `path` (without locale prefix) names a business, offer, category or area that does not exist. */
export function hasUnknownSlug(path: string) {
  const [first, second, third] = path.split("/").slice(1);
  if (!first) return false;
  if (first === "businesses") return second !== undefined && !BUSINESSES.has(second);
  if (first === "offers") return second !== undefined && !CATEGORIES.has(second) && !OFFERS.has(second);
  if (first === "categories") return second !== undefined && !CATEGORIES.has(second);
  if (PAGES.has(first)) return false;
  if (!AREAS.has(first)) return true;
  return (second === "offers" || second === "categories") && third !== undefined && !CATEGORIES.has(third);
}

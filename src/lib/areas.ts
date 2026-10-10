/**
 * Area-scoped URLs. The offers list, the categories list and each category
 * page also exist per area: "/offers" → "/kalawad-road/offers". Everything
 * else (home, offer details, businesses, forms…) is not area-specific.
 */
const AREA_SCOPED = /^\/(?:offers|categories(?:\/[^/?#]+)?)(?=[?#]|$)/;

/** "/offers", "/categories" and "/categories/food" can be scoped to an area. */
export function isAreaScoped(href: string) {
  return AREA_SCOPED.test(href);
}

/** Puts `area` in front of an area-scoped href; any other href is returned as is. */
export function areaHref(area: string | undefined, href: string) {
  return area && isAreaScoped(href) ? `/${area}${href}` : href;
}

/**
 * The offers list for an area and/or category: "/offers", "/offers/electronics",
 * "/kalawad-road/offers", "/kalawad-road/offers/electronics". Built explicitly
 * because "/offers/electronics" looks like an offer page to `areaHref`.
 */
export function offersPath(area?: string, category?: string) {
  return `${area ? `/${area}` : ""}/offers${category ? `/${category}` : ""}`;
}

/** "/kalawad-road/offers" → "/offers" (the path without its area prefix). */
export function stripArea(path: string, area: string | undefined) {
  if (!area) return path;
  const prefix = `/${area}`;
  if (path === prefix) return "/";
  return path.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path;
}

/**
 * Older links kept the area and category in the query ("/offers?area=mavdi&category=food",
 * "/categories/food?area=mavdi"). Returns the path form ("/mavdi/offers/food",
 * "/mavdi/categories/food") with the remaining query kept, or null when `path` is not
 * one of those pages or carries no such params.
 */
export function canonicalAreaUrl(path: string, params: URLSearchParams) {
  const slug = (value: string | null | undefined) => (value && /^[a-z0-9-]+$/.test(value) ? value : undefined);
  const area = slug(params.get("area")?.split(",")[0]);
  const category = slug(params.get("category"));
  if (!params.has("area") && !params.has("category")) return null;

  const rest = new URLSearchParams(params);
  rest.delete("area");
  rest.delete("category");
  const query = rest.size ? `?${rest}` : "";

  const offers = /^(?:\/([^/]+))?\/offers$/.exec(path);
  if (offers) return `${offersPath(area ?? offers[1], category)}${query}`;

  const categoryPage = /^\/categories\/([^/]+)$/.exec(path);
  if (categoryPage && area) return `/${area}/categories/${categoryPage[1]}${query}`;
  return null;
}

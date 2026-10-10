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

/** "/kalawad-road/offers" → "/offers" (the path without its area prefix). */
export function stripArea(path: string, area: string | undefined) {
  if (!area) return path;
  const prefix = `/${area}`;
  if (path === prefix) return "/";
  return path.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path;
}

/**
 * Cache Components refuses an empty `generateStaticParams`, and a site with no live offers yet has
 * no areas or shops to list. This stands in for an empty list: every page treats it as unknown and
 * answers 404, and real paths still render on demand.
 */
export const NO_PARAM = "__none__";

export function atLeastOne<T extends Record<string, string>>(params: T[], placeholder: T): T[] {
  return params.length ? params : [placeholder];
}

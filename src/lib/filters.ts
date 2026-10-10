import type { OfferFilters, OfferType, SortKey, ValidityKey } from "@/types";

export const OFFER_TYPES: { value: OfferType; label: string }[] = [
  { value: "percent", label: "% ડિસ્કાઉન્ટ" },
  { value: "flat", label: "ફ્લેટ ડિસ્કાઉન્ટ" },
  { value: "bogo", label: "1 પર 1 ફ્રી" },
  { value: "combo", label: "કોમ્બો" },
];

export const SUBMIT_OFFER_TYPES: { value: OfferType; label: string }[] = [
  { value: "percent", label: "% ડિસ્કાઉન્ટ" },
  { value: "flat", label: "ફ્લેટ ડિસ્કાઉન્ટ" },
  { value: "bogo", label: "1 પર 1 ફ્રી" },
  { value: "combo", label: "કોમ્બો / પેકેજ" },
  { value: "other", label: "બીજું" },
];

export const VALIDITY_OPTIONS: { value: ValidityKey; label: string }[] = [
  { value: "today", label: "આજે" },
  { value: "week", label: "આ અઠવાડિયે" },
  { value: "month", label: "આ મહિને" },
];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "નવી ઓફર્સ" },
  { value: "ending", label: "જલ્દી પૂરી થતી" },
  { value: "discount", label: "સૌથી વધુ ડિસ્કાઉન્ટ" },
];

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(value: string | undefined, options: { value: T }[]) {
  return options.find((o) => o.value === value)?.value;
}

/** Reads offer filters from URL search params; unknown values are dropped. */
export function parseFilters(params: RawParams): OfferFilters {
  const areaParam = params.area;
  const areas = (Array.isArray(areaParam) ? areaParam : areaParam ? [areaParam] : []).flatMap(
    (a) => a.split(","),
  );
  const page = Number(first(params.page));
  return {
    q: first(params.q)?.slice(0, 100) || undefined,
    category: first(params.category) || undefined,
    subcategory: first(params.sub) || undefined,
    areas: areas.length ? areas : undefined,
    type: oneOf(first(params.type), OFFER_TYPES),
    validity: oneOf(first(params.validity), VALIDITY_OPTIONS),
    sort: oneOf(first(params.sort), SORT_OPTIONS),
    page: Number.isInteger(page) && page > 1 ? page : undefined,
  };
}

/** Number of filters set in the filter panel (area, type, validity). */
export function countPanelFilters(filters: OfferFilters) {
  return (filters.areas?.length ?? 0) + (filters.type ? 1 : 0) + (filters.validity ? 1 : 0);
}

/**
 * Builds "?a=b" for a filter state. Any change other than `page`
 * starts again from page 1.
 */
export function filtersToQuery(filters: OfferFilters, patch: Partial<OfferFilters> = {}) {
  const next: OfferFilters = { ...filters, ...patch };
  if (!("page" in patch)) delete next.page;

  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  if (next.subcategory) params.set("sub", next.subcategory);
  next.areas?.forEach((a) => params.append("area", a));
  if (next.type) params.set("type", next.type);
  if (next.validity) params.set("validity", next.validity);
  if (next.sort && next.sort !== "newest") params.set("sort", next.sort);
  if (next.page && next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return query ? `?${query}` : "";
}

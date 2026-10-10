/**
 * JSON envelope shared by every /api/v1 route:
 *   success → { data, meta? }
 *   error   → { error: { code, message, fields? } }
 */

export type ErrorCode = "VALIDATION_FAILED" | "NOT_FOUND" | "INTERNAL";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/** Public reads may be cached by the CDN for 5 minutes and served stale for an hour while refreshing. */
const PUBLIC_CACHE = "public, s-maxage=300, stale-while-revalidate=3600";

export function ok<T>(data: T, meta?: PageMeta | Record<string, unknown>) {
  return Response.json(meta ? { data, meta } : { data }, { headers: { "Cache-Control": PUBLIC_CACHE } });
}

export function fail(status: number, code: ErrorCode, message: string, fields?: Record<string, string>) {
  return Response.json(
    { error: { code, message, ...(fields && { fields }) } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function notFound(what: string) {
  return fail(404, "NOT_FOUND", `${what} not found`);
}

/** URL search params as a plain object (last value wins), ready for a zod schema. */
export function queryOf(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams);
}

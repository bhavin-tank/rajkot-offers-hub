import type { ErrorCode } from "./errors";

/**
 * JSON envelope shared by every /api/v1 route:
 *   success → { data, meta? }
 *   error   → { error: { code, message, fields?, attemptsLeft? } }
 */

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

/** A response that must never be cached: writes and anything for one signed-in user. */
export function privateOk<T>(data: T, init: { status?: number; meta?: PageMeta | Record<string, unknown> } = {}) {
  return Response.json(init.meta ? { data, meta: init.meta } : { data }, {
    status: init.status ?? 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export function fail(
  status: number,
  code: ErrorCode,
  message: string,
  extra: { fields?: Record<string, string>; retryAfter?: number; attemptsLeft?: number } = {},
) {
  const { fields, retryAfter, attemptsLeft } = extra;
  return Response.json(
    { error: { code, message, ...(fields && { fields }), ...(attemptsLeft !== undefined && { attemptsLeft }) } },
    { status, headers: { "Cache-Control": "no-store", ...(retryAfter && { "Retry-After": String(retryAfter) }) } },
  );
}

export function notFound(what: string) {
  return fail(404, "NOT_FOUND", `${what} not found`);
}

export function paging(page: number, limit: number, total: number): PageMeta {
  return { page, limit, total, hasMore: page * limit < total };
}

/** URL search params as a plain object (last value wins), ready for a zod schema. */
export function queryOf(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams);
}

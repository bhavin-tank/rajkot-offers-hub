import { areasFor, areasWithCountsFor } from "@/lib/data/categories";
import { ok, queryOf } from "@/server/lib/http";
import { handle } from "@/app/api/v1/_lib/handle";
import { areaListQuery } from "@/server/validators/public";

/**
 * Rajkot areas in catalog order, or with `withCounts=true` each with its live
 * offer count (most offers first) and `totalOffers` for all of Rajkot.
 */
export function GET(request: Request) {
  return handle(async () => {
    const { lang, withCounts } = areaListQuery.parse(queryOf(request));
    if (!withCounts) return ok(await areasFor(lang));
    const { total, areas } = await areasWithCountsFor(lang);
    return ok(areas, { totalOffers: total });
  });
}

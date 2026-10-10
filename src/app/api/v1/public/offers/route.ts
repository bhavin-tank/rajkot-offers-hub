import { offersFor } from "@/lib/data/offers";
import { ok, queryOf } from "@/server/lib/http";
import { handle } from "@/app/api/v1/_lib/handle";
import { offerListQuery } from "@/server/validators/public";

/** Live offers, filtered and sorted like the website's offer lists. */
export function GET(request: Request) {
  return handle(async () => {
    const { lang, q, category, sub, areas, type, validity, sort, page, limit } = offerListQuery.parse(queryOf(request));
    const filters = { q, category, subcategory: sub, areas, type, validity, sort };
    const { items, total } = await offersFor(lang, filters, { skip: (page - 1) * limit, limit });
    return ok(items, { page, limit, total, hasMore: page * limit < total });
  });
}

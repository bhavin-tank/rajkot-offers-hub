import { categoriesFor } from "@/lib/data/categories";
import { ok, queryOf } from "@/server/lib/http";
import { handle } from "@/app/api/v1/_lib/handle";
import { categoryListQuery } from "@/server/validators/public";

/** Every category with its live offer count, for all of Rajkot or one area. */
export function GET(request: Request) {
  return handle(async () => {
    const { lang, area } = categoryListQuery.parse(queryOf(request));
    return ok(await categoriesFor(lang, area));
  });
}

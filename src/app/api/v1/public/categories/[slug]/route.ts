import { categoriesFor } from "@/lib/data/categories";
import { notFound, ok, queryOf } from "@/server/lib/http";
import { handle } from "@/app/api/v1/_lib/handle";
import { categoryListQuery } from "@/server/validators/public";

/** One category with its subcategories and live offer count (in one area when `area` is given). */
export function GET(request: Request, ctx: RouteContext<"/api/v1/public/categories/[slug]">) {
  return handle(async () => {
    const [{ slug }, { lang, area }] = await Promise.all([ctx.params, categoryListQuery.parseAsync(queryOf(request))]);
    const category = (await categoriesFor(lang, area)).find((c) => c.slug === slug);
    return category ? ok(category) : notFound("Category");
  });
}

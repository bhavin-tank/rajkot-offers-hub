import { businessFor } from "@/lib/data/businesses";
import { categoriesFor } from "@/lib/data/categories";
import { offerFor } from "@/lib/data/offers";
import { notFound, ok, queryOf } from "@/server/lib/http";
import { handle } from "@/app/api/v1/_lib/handle";
import { langQuery } from "@/server/validators/public";

/** One offer, live or past, with its business and category. */
export function GET(request: Request, ctx: RouteContext<"/api/v1/public/offers/[slug]">) {
  return handle(async () => {
    const [{ slug }, { lang }] = await Promise.all([ctx.params, langQuery.parseAsync(queryOf(request))]);
    const offer = await offerFor(lang, slug);
    if (!offer) return notFound("Offer");
    const [business, categories] = await Promise.all([businessFor(lang, offer.businessSlug), categoriesFor(lang)]);
    const category = categories.find((c) => c.slug === offer.categorySlug);
    return ok({ ...offer, business: business ?? null, category: category ?? null });
  });
}

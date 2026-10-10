import { offerFor, similarOffersFor } from "@/lib/data/offers";
import { notFound, ok, queryOf } from "@/server/lib/http";
import { handle } from "@/app/api/v1/_lib/handle";
import { limitQuery } from "@/server/validators/public";

const query = limitQuery(4);

/** Live offers like this one: same category first, then any other. */
export function GET(request: Request, ctx: RouteContext<"/api/v1/public/offers/[slug]/similar">) {
  return handle(async () => {
    const [{ slug }, { lang, limit }] = await Promise.all([ctx.params, query.parseAsync(queryOf(request))]);
    const offer = await offerFor(lang, slug);
    if (!offer) return notFound("Offer");
    return ok(await similarOffersFor(lang, { slug: offer.slug, categorySlug: offer.categorySlug }, limit));
  });
}

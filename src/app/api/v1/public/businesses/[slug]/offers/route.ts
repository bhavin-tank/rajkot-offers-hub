import { businessFor } from "@/lib/data/businesses";
import { businessOffersFor } from "@/lib/data/offers";
import { notFound, ok, queryOf } from "@/server/lib/http";
import { handle } from "@/app/api/v1/_lib/handle";
import { langQuery } from "@/server/validators/public";

/** A business's live offers and past offers. */
export function GET(request: Request, ctx: RouteContext<"/api/v1/public/businesses/[slug]/offers">) {
  return handle(async () => {
    const [{ slug }, { lang }] = await Promise.all([ctx.params, langQuery.parseAsync(queryOf(request))]);
    const [business, offers] = await Promise.all([businessFor(lang, slug), businessOffersFor(lang, slug)]);
    return business ? ok(offers) : notFound("Business");
  });
}

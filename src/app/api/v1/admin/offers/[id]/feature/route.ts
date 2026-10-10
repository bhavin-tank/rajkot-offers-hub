import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { setOfferFeatured } from "@/server/services/admin/offers";
import { featuredInput } from "@/server/validators/admin";

/** Features or un-features an offer. */
export const POST = adminRoute<RouteContext<"/api/v1/admin/offers/[id]/feature">>(async (actor, request, ctx) => {
  const { id } = await ctx.params;
  const { featured } = featuredInput.parse(await jsonBody(request));
  await setOfferFeatured(id, featured, actor);
  refreshTags(WRITE_TAGS.offer, "route");
  return privateOk({ id, featured });
});

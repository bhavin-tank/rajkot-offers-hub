import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { toApi } from "@/app/api/v1/_lib/serialize";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { getOffer, updateOffer } from "@/server/services/admin/offers";
import { offerInput } from "@/server/validators/admin";

export const GET = adminRoute<RouteContext<"/api/v1/admin/offers/[id]">>(async (_actor, _request, ctx) => {
  return privateOk(toApi(await getOffer((await ctx.params).id)));
});

/** Replaces the offer's content. Status changes have their own endpoints. */
export const PATCH = adminRoute<RouteContext<"/api/v1/admin/offers/[id]">>(async (actor, request, ctx) => {
  const offer = await updateOffer((await ctx.params).id, offerInput.parse(await jsonBody(request)), actor);
  refreshTags(WRITE_TAGS.offer, "route");
  return privateOk(toApi(offer));
});

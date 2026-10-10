import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { toApi } from "@/app/api/v1/_lib/serialize";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { businessOfferCounts, getBusiness, updateBusiness } from "@/server/services/admin/businesses";
import { businessInput } from "@/server/validators/admin";

/** A business with its offer counts by status. */
export const GET = adminRoute<RouteContext<"/api/v1/admin/businesses/[id]">>(async (_actor, _request, ctx) => {
  const business = await getBusiness((await ctx.params).id);
  return privateOk({ ...toApi(business), offerCounts: await businessOfferCounts(business._id!) });
});

/** Replaces the profile; its offers' copies of name, area and address follow. */
export const PATCH = adminRoute<RouteContext<"/api/v1/admin/businesses/[id]">>(async (actor, request, ctx) => {
  const business = await updateBusiness((await ctx.params).id, businessInput.parse(await jsonBody(request)), actor);
  refreshTags(WRITE_TAGS.business, "route");
  return privateOk(toApi(business));
});

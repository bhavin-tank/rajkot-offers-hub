import { adminRoute } from "@/app/api/v1/_lib/auth";
import { toApi } from "@/app/api/v1/_lib/serialize";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { approveOffer } from "@/server/services/admin/offers";

/** Publishes a draft, pending or rejected offer. */
export const POST = adminRoute<RouteContext<"/api/v1/admin/offers/[id]/approve">>(async (actor, _request, ctx) => {
  const { id } = await ctx.params;
  const result = await approveOffer(id, actor);
  refreshTags(WRITE_TAGS.offer, "route");
  return privateOk(result ? toApi(result) : { id });
});

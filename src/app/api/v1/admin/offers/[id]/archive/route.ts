import { adminRoute } from "@/app/api/v1/_lib/auth";
import { toApi } from "@/app/api/v1/_lib/serialize";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { archiveOffer } from "@/server/services/admin/offers";

/** Archives an offer: hidden everywhere, kept for history. */
export const POST = adminRoute<RouteContext<"/api/v1/admin/offers/[id]/archive">>(async (actor, _request, ctx) => {
  const { id } = await ctx.params;
  const result = await archiveOffer(id, actor);
  refreshTags(WRITE_TAGS.offer, "route");
  return privateOk(result ? toApi(result) : { id });
});

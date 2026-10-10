import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { toApi } from "@/app/api/v1/_lib/serialize";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { rejectOffer } from "@/server/services/admin/offers";
import { reasonInput } from "@/server/validators/admin";

/** Rejects a draft or pending offer with a reason the owner will see. */
export const POST = adminRoute<RouteContext<"/api/v1/admin/offers/[id]/reject">>(async (actor, request, ctx) => {
  const { id } = await ctx.params;
  const { reason } = reasonInput.parse(await jsonBody(request));
  const result = await rejectOffer(id, reason, actor);
  refreshTags(WRITE_TAGS.offer, "route");
  return privateOk(result ? toApi(result) : { id });
});

import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { toApi } from "@/app/api/v1/_lib/serialize";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { pauseOffer } from "@/server/services/admin/offers";
import { z } from "zod";

/** Takes a live offer down (e.g. after a report). */
export const POST = adminRoute<RouteContext<"/api/v1/admin/offers/[id]/pause">>(async (actor, request, ctx) => {
  const { id } = await ctx.params;
  const { reason } = z.object({ reason: z.string().trim().max(500).optional() }).parse(await jsonBody(request));
  const result = await pauseOffer(id, actor, reason);
  refreshTags(WRITE_TAGS.offer, "route");
  return privateOk(result ? toApi(result) : { id });
});

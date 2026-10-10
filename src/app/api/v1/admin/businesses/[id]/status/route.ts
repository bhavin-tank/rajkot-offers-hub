import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { setBusinessStatus } from "@/server/services/admin/businesses";
import { businessStatusInput } from "@/server/validators/admin";

/** Suspends (hides it and pauses its live offers) or reactivates a business. */
export const POST = adminRoute<RouteContext<"/api/v1/admin/businesses/[id]/status">>(async (actor, request, ctx) => {
  const { id } = await ctx.params;
  const { status } = businessStatusInput.parse(await jsonBody(request));
  await setBusinessStatus(id, status, actor);
  refreshTags(WRITE_TAGS.business, "route");
  return privateOk({ id, status });
});

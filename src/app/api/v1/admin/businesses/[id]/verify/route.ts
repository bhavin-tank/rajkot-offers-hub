import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { setBusinessVerified } from "@/server/services/admin/businesses";
import { verifiedInput } from "@/server/validators/admin";

export const POST = adminRoute<RouteContext<"/api/v1/admin/businesses/[id]/verify">>(async (actor, request, ctx) => {
  const { id } = await ctx.params;
  const { verified } = verifiedInput.parse(await jsonBody(request));
  await setBusinessVerified(id, verified, actor);
  refreshTags(WRITE_TAGS.business, "route");
  return privateOk({ id, verified });
});

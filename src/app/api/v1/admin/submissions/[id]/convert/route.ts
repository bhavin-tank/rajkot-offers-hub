import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { convertSubmission } from "@/server/services/admin/submissions";
import { convertInput } from "@/server/validators/admin";

/** Creates the offer (and, with `business: "new"`, the business) from a submission. */
export const POST = adminRoute<RouteContext<"/api/v1/admin/submissions/[id]/convert">>(async (actor, request, ctx) => {
  const input = convertInput.parse(await jsonBody(request));
  const result = await convertSubmission((await ctx.params).id, input, actor);
  refreshTags(WRITE_TAGS.business, "route");
  return privateOk(result, { status: 201 });
});

import { adminRoute } from "@/app/api/v1/_lib/auth";
import { privateOk } from "@/server/lib/http";
import { markSubmissionInReview } from "@/server/services/admin/submissions";

/** Marks a new submission as being looked at. */
export const POST = adminRoute<RouteContext<"/api/v1/admin/submissions/[id]/review">>(async (actor, _request, ctx) => {
  const { id } = await ctx.params;
  await markSubmissionInReview(id, actor);
  return privateOk({ id });
});

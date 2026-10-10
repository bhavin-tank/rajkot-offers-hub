import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { privateOk } from "@/server/lib/http";
import { rejectSubmission } from "@/server/services/admin/submissions";
import { submissionRejectInput } from "@/server/validators/admin";

/** Rejects a submission, or marks it spam. */
export const POST = adminRoute<RouteContext<"/api/v1/admin/submissions/[id]/reject">>(async (actor, request, ctx) => {
  const { id } = await ctx.params;
  const { reason, spam } = submissionRejectInput.parse(await jsonBody(request));
  await rejectSubmission(id, reason, spam, actor);
  return privateOk({ id });
});

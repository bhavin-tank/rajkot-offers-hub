import { adminRoute } from "@/app/api/v1/_lib/auth";
import { toApi } from "@/app/api/v1/_lib/serialize";
import { privateOk } from "@/server/lib/http";
import { getSubmission, matchingBusinesses } from "@/server/services/admin/submissions";

/** One submission, with existing businesses that look like the same shop. */
export const GET = adminRoute<RouteContext<"/api/v1/admin/submissions/[id]">>(async (_actor, _request, ctx) => {
  const submission = await getSubmission((await ctx.params).id);
  const matches = await matchingBusinesses(submission);
  return privateOk({ ...toApi(submission), matchingBusinesses: matches.map((b) => ({ id: b._id!.toHexString(), name: b.name, slug: b.slug })) });
});

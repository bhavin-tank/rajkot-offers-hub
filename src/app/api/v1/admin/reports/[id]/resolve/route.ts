import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { privateOk } from "@/server/lib/http";
import { resolveReport } from "@/server/services/admin/inbox";
import { reportResolveInput } from "@/server/validators/admin";

/** Closes a report as actioned or dismissed. To take the offer down, pause it as well. */
export const POST = adminRoute<RouteContext<"/api/v1/admin/reports/[id]/resolve">>(async (actor, request, ctx) => {
  const { id } = await ctx.params;
  const change = reportResolveInput.parse(await jsonBody(request));
  await resolveReport(id, change, actor);
  return privateOk({ id, ...change });
});

import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { privateOk } from "@/server/lib/http";
import { updateContactMessage } from "@/server/services/admin/inbox";
import { contactUpdateInput } from "@/server/validators/admin";

/** Sets a message's status or internal note. */
export const PATCH = adminRoute<RouteContext<"/api/v1/admin/contact/[id]">>(async (actor, request, ctx) => {
  const { id } = await ctx.params;
  const change = contactUpdateInput.parse(await jsonBody(request));
  await updateContactMessage(id, change, actor);
  return privateOk({ id, ...change });
});

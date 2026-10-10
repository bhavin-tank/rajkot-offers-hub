import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { privateOk } from "@/server/lib/http";
import { updateUser } from "@/server/services/admin/users";
import { userUpdateInput } from "@/server/validators/admin";

/** Changes role (superadmin only), status or name. Blocking signs the user out everywhere. */
export const PATCH = adminRoute<RouteContext<"/api/v1/admin/users/[id]">>(async (actor, request, ctx) => {
  const { id } = await ctx.params;
  const change = userUpdateInput.parse(await jsonBody(request));
  await updateUser(id, change, actor);
  return privateOk({ id, ...change });
});

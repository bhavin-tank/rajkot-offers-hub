import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { pageToApi, toApi } from "@/app/api/v1/_lib/serialize";
import { privateOk, queryOf } from "@/server/lib/http";
import { addAdmin, listUsers } from "@/server/services/admin/users";
import { addUserInput, listQuery } from "@/server/validators/admin";

/** Users; `status` filters by role, `q` matches name or mobile digits. */
export const GET = adminRoute(async (_actor, request) => {
  const { data, meta } = pageToApi(await listUsers(listQuery.parse(queryOf(request))));
  return privateOk(data, { meta });
});

/** Gives a mobile number admin access (superadmin only). */
export const POST = adminRoute(async (actor, request) => {
  const { mobile, role, name } = addUserInput.parse(await jsonBody(request));
  return privateOk(toApi(await addAdmin(mobile, role, name, actor)), { status: 201 });
});

import { adminRoute } from "@/app/api/v1/_lib/auth";
import { pageToApi } from "@/app/api/v1/_lib/serialize";
import { privateOk, queryOf } from "@/server/lib/http";
import { listSubmissions } from "@/server/services/admin/submissions";
import { listQuery } from "@/server/validators/admin";

/** Submit-offer forms; `status=open` lists new and in-review ones oldest first. */
export const GET = adminRoute(async (_actor, request) => {
  const { data, meta } = pageToApi(await listSubmissions(listQuery.parse(queryOf(request))));
  return privateOk(data, { meta });
});

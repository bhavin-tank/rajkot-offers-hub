import { adminRoute } from "@/app/api/v1/_lib/auth";
import { pageToApi } from "@/app/api/v1/_lib/serialize";
import { privateOk, queryOf } from "@/server/lib/http";
import { listReports } from "@/server/services/admin/inbox";
import { listQuery } from "@/server/validators/admin";

/** Offer reports; `status=open|actioned|dismissed`. */
export const GET = adminRoute(async (_actor, request) => {
  const { data, meta } = pageToApi(await listReports(listQuery.parse(queryOf(request))));
  return privateOk(data, { meta });
});

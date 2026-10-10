import { adminRoute } from "@/app/api/v1/_lib/auth";
import { pageToApi } from "@/app/api/v1/_lib/serialize";
import { privateOk, queryOf } from "@/server/lib/http";
import { listContactMessages } from "@/server/services/admin/inbox";
import { listQuery } from "@/server/validators/admin";

/** Contact form messages; `status=new|replied|closed`. */
export const GET = adminRoute(async (_actor, request) => {
  const { data, meta } = pageToApi(await listContactMessages(listQuery.parse(queryOf(request))));
  return privateOk(data, { meta });
});

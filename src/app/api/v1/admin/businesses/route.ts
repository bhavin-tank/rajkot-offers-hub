import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { pageToApi, toApi } from "@/app/api/v1/_lib/serialize";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk, queryOf } from "@/server/lib/http";
import { createBusiness, listBusinesses } from "@/server/services/admin/businesses";
import { businessInput, listQuery } from "@/server/validators/admin";

/** Businesses; `q` matches name, slug, area or phone digits, `status` filters. */
export const GET = adminRoute(async (_actor, request) => {
  const { data, meta } = pageToApi(await listBusinesses(listQuery.parse(queryOf(request))));
  return privateOk(data, { meta });
});

export const POST = adminRoute(async (actor, request) => {
  const business = await createBusiness(businessInput.parse(await jsonBody(request)), actor);
  refreshTags(WRITE_TAGS.business, "route");
  return privateOk(toApi(business), { status: 201 });
});

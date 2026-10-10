import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { toApi } from "@/app/api/v1/_lib/serialize";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { createCategory, listAllCategories } from "@/server/services/admin/catalog";
import { categoryInput } from "@/server/validators/admin";

/** Every category, hidden ones included. */
export const GET = adminRoute(async () => privateOk((await listAllCategories()).map(toApi)));

export const POST = adminRoute(async (actor, request) => {
  const id = await createCategory(categoryInput.parse(await jsonBody(request)), actor);
  refreshTags(WRITE_TAGS.catalog, "route");
  return privateOk({ id: id.toHexString() }, { status: 201 });
});

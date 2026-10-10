import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { toApi } from "@/app/api/v1/_lib/serialize";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk } from "@/server/lib/http";
import { deleteCategory, getCategoryById, updateCategory } from "@/server/services/admin/catalog";
import { categoryInput } from "@/server/validators/admin";

export const GET = adminRoute<RouteContext<"/api/v1/admin/categories/[id]">>(async (_actor, _request, ctx) => privateOk(toApi(await getCategoryById((await ctx.params).id))));

/** Updates everything but the slug, which is fixed once created. */
export const PATCH = adminRoute<RouteContext<"/api/v1/admin/categories/[id]">>(async (actor, request, ctx) => {
  const { id } = await ctx.params;
  await updateCategory(id, categoryInput.parse(await jsonBody(request)), actor);
  refreshTags(WRITE_TAGS.catalog, "route");
  return privateOk(toApi(await getCategoryById(id)));
});

/** Deletes an unused category; one still in use must be hidden instead. */
export const DELETE = adminRoute<RouteContext<"/api/v1/admin/categories/[id]">>(async (actor, _request, ctx) => {
  const { id } = await ctx.params;
  await deleteCategory(id, actor);
  refreshTags(WRITE_TAGS.catalog, "route");
  return privateOk({ id, deleted: true });
});

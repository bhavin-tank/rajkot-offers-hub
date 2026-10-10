import { z } from "zod";
import { adminRoute } from "@/app/api/v1/_lib/auth";
import { pageToApi } from "@/app/api/v1/_lib/serialize";
import { privateOk, queryOf } from "@/server/lib/http";
import { listAudit } from "@/server/services/audit";

const query = z.object({
  entity: z.string().max(30).optional(),
  entityId: z.string().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/** Admin actions, newest first; filter by `entity` and `entityId`. */
export const GET = adminRoute(async (_actor, request) => {
  const params = query.parse(queryOf(request));
  const { items, total } = await listAudit(params);
  const { data, meta } = pageToApi({ items, total, page: params.page, limit: params.limit });
  return privateOk(data, { meta });
});

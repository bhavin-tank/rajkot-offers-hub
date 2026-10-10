import { adminRoute } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { pageToApi, toApi } from "@/app/api/v1/_lib/serialize";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { privateOk, queryOf } from "@/server/lib/http";
import { z } from "zod";
import { createOffer, listOffers } from "@/server/services/admin/offers";
import { listQuery, offerInput } from "@/server/validators/admin";

const createQuery = z.object({ status: z.enum(["draft", "pending", "approved"]).default("draft") });

/** All offers, any status; `status=pending` lists the moderation queue oldest first. */
export const GET = adminRoute(async (_actor, request) => {
  const page = await listOffers(listQuery.parse(queryOf(request)));
  const { data, meta } = pageToApi(page);
  return privateOk(data, { meta });
});

/** Creates an offer (draft unless `?status=pending|approved`). */
export const POST = adminRoute(async (actor, request) => {
  const { status } = createQuery.parse(queryOf(request));
  const offer = await createOffer(offerInput.parse(await jsonBody(request)), actor, status);
  if (status === "approved") refreshTags(WRITE_TAGS.offer, "route");
  return privateOk(toApi(offer), { status: 201 });
});

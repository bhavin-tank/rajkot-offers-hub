import { ObjectId } from "mongodb";
import { z } from "zod";
import { adminRoute, metaOf } from "@/app/api/v1/_lib/auth";
import { jsonBody } from "@/app/api/v1/_lib/handle";
import { privateOk } from "@/server/lib/http";
import { createUpload } from "@/server/services/media";

const body = z.object({
  mime: z.string(),
  bytes: z.number().int().positive(),
  purpose: z.enum(["offer", "business_cover", "business_photo", "category"]),
});

/** Starts a photo upload for an offer, business or category; PUT the file to `uploadUrl`, then use `url`. */
export const POST = adminRoute(async (actor, request) => {
  const { mime, bytes, purpose } = body.parse(await jsonBody(request));
  return privateOk(await createUpload({ mime, bytes, purpose, ownerId: new ObjectId(actor.id), ip: metaOf(request).ip }), { status: 201 });
});

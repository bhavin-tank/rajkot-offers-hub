import { metaOf } from "@/app/api/v1/_lib/auth";
import { handle, jsonBody } from "@/app/api/v1/_lib/handle";
import { privateOk } from "@/server/lib/http";
import { createUpload } from "@/server/services/media";
import { uploadBody } from "@/server/validators/public";

/**
 * Starts a photo upload for the submit-offer form: PUT the file to `uploadUrl`
 * with the returned headers, then send `mediaId` with the submission.
 */
export function POST(request: Request) {
  return handle(async () => {
    const { mime, bytes } = uploadBody.parse(await jsonBody(request));
    return privateOk(await createUpload({ mime, bytes, purpose: "submission", ip: metaOf(request).ip }), { status: 201 });
  });
}

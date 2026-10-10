import { metaOf } from "@/app/api/v1/_lib/auth";
import { handle, jsonBody } from "@/app/api/v1/_lib/handle";
import { privateOk } from "@/server/lib/http";
import { createSubmission } from "@/server/services/inbound";
import { submissionBody } from "@/server/validators/public";

/** The public "submit an offer" form. Photos are uploaded first through /public/uploads. */
export function POST(request: Request) {
  return handle(async () => {
    const input = submissionBody.parse(await jsonBody(request));
    return privateOk(await createSubmission(input, { ip: metaOf(request).ip }), { status: 201 });
  });
}

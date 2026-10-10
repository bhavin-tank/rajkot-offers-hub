import { metaOf } from "@/app/api/v1/_lib/auth";
import { handle, jsonBody } from "@/app/api/v1/_lib/handle";
import { privateOk } from "@/server/lib/http";
import { createContactMessage } from "@/server/services/inbound";
import { contactBody } from "@/server/validators/public";

/** The contact form. */
export function POST(request: Request) {
  return handle(async () => {
    const input = contactBody.parse(await jsonBody(request));
    return privateOk(await createContactMessage(input, { ip: metaOf(request).ip }), { status: 201 });
  });
}

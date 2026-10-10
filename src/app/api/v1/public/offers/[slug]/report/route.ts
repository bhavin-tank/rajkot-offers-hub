import { metaOf } from "@/app/api/v1/_lib/auth";
import { handle, jsonBody } from "@/app/api/v1/_lib/handle";
import { privateOk } from "@/server/lib/http";
import { createReport } from "@/server/services/inbound";
import { reportBody } from "@/server/validators/public";

/** Reports a problem with an offer. One report per visitor per offer per day. */
export function POST(request: Request, ctx: RouteContext<"/api/v1/public/offers/[slug]/report">) {
  return handle(async () => {
    const [{ slug }, body] = await Promise.all([ctx.params, jsonBody(request)]);
    return privateOk(await createReport(slug, reportBody.parse(body), { ip: metaOf(request).ip }), { status: 201 });
  });
}

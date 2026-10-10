import { offersBySlugsFor } from "@/lib/data/offers";
import { ok, queryOf } from "@/server/lib/http";
import { handle } from "@/app/api/v1/_lib/handle";
import { langQuery, offerBatchBody } from "@/server/validators/public";

/** Cards for up to 100 offers by slug (e.g. a visitor's saved offers), live or past, in the order asked. */
export function POST(request: Request) {
  return handle(async () => {
    const { lang } = langQuery.parse(queryOf(request));
    const { slugs } = offerBatchBody.parse(await request.json().catch(() => ({})));
    return ok(await offersBySlugsFor(lang, [...new Set(slugs)]));
  });
}

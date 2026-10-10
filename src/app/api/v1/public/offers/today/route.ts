import { offersFor } from "@/lib/data/offers";
import { ok, queryOf } from "@/server/lib/http";
import { handle } from "@/app/api/v1/_lib/handle";
import { limitQuery } from "@/server/validators/public";

const query = limitQuery(6);

/** Live offers ending soonest. */
export function GET(request: Request) {
  return handle(async () => {
    const { lang, limit } = query.parse(queryOf(request));
    return ok((await offersFor(lang, { sort: "ending" }, { limit })).items);
  });
}

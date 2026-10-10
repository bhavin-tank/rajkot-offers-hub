import { getSlugs } from "@/lib/data/cache";
import { ok } from "@/server/lib/http";
import { handle } from "@/app/api/v1/_lib/handle";

/** Every public slug, for clients that need to tell real pages from 404s. */
export function GET() {
  return handle(async () => ok(await getSlugs()));
}

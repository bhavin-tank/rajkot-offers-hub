import { connection } from "next/server";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { expireOffers } from "@/server/services/admin/offers";

/**
 * Nightly: approved offers past their last day become `expired`.
 * Called by the scheduler (vercel.json) with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  await connection();
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: { code: "UNAUTHENTICATED", message: "Bad cron secret" } }, { status: 401 });
  }
  const expired = await expireOffers();
  if (expired) refreshTags(WRITE_TAGS.offer, "route");
  console.info(`[cron] expire-offers: ${expired} offers expired`);
  return Response.json({ data: { expired } }, { headers: { "Cache-Control": "no-store" } });
}

import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { adminRoute } from "@/app/api/v1/_lib/auth";
import { clearSessionCookies } from "@/lib/auth/cookies";
import { privateOk } from "@/server/lib/http";
import { revokeAllSessions } from "@/server/services/auth";

/** Ends every session of the signed-in user, on all devices. */
export const POST = adminRoute(async (actor) => {
  await revokeAllSessions(new ObjectId(actor.id));
  clearSessionCookies(await cookies());
  return privateOk({ signedOut: true });
});

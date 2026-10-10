import { adminRoute } from "@/app/api/v1/_lib/auth";
import { privateOk } from "@/server/lib/http";

/** The signed-in user. */
export const GET = adminRoute(async (actor) => privateOk(actor));

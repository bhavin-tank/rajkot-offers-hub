import { z } from "zod";
import { metaOf } from "@/app/api/v1/_lib/auth";
import { handle, jsonBody } from "@/app/api/v1/_lib/handle";
import { SIGN_IN_ROLES } from "@/app/api/v1/_lib/sign-in";
import { privateOk } from "@/server/lib/http";
import { requestOtp } from "@/server/services/auth";

const body = z.object({ mobile: z.string().trim().min(10).max(16) });

/** Sends a 6-digit sign-in code on WhatsApp. */
export function POST(request: Request) {
  return handle(async () => {
    const { mobile } = body.parse(await jsonBody(request));
    return privateOk(await requestOtp(mobile, metaOf(request), { roles: SIGN_IN_ROLES }));
  });
}

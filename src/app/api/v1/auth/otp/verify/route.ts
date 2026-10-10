import { cookies } from "next/headers";
import { z } from "zod";
import { metaOf } from "@/app/api/v1/_lib/auth";
import { handle, jsonBody } from "@/app/api/v1/_lib/handle";
import { SIGN_IN_ROLES } from "@/app/api/v1/_lib/sign-in";
import { setSessionCookies } from "@/lib/auth/cookies";
import { privateOk } from "@/server/lib/http";
import { verifyOtp } from "@/server/services/auth";

const body = z.object({ requestId: z.string().min(1), code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") });

/** Checks the code and opens a session: tokens in the body, and as cookies for the website. */
export function POST(request: Request) {
  return handle(async () => {
    const { requestId, code } = body.parse(await jsonBody(request));
    const result = await verifyOtp(requestId, code, metaOf(request), { roles: SIGN_IN_ROLES });
    setSessionCookies(await cookies(), result);
    return privateOk(result);
  });
}

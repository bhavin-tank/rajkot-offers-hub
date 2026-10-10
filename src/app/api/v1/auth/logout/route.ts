import { cookies } from "next/headers";
import { z } from "zod";
import { handle, jsonBody } from "@/app/api/v1/_lib/handle";
import { clearSessionCookies, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { privateOk } from "@/server/lib/http";
import { revokeRefreshToken } from "@/server/services/auth";

const body = z.object({ refreshToken: z.string().optional() });

/** Ends this session. */
export function POST(request: Request) {
  return handle(async () => {
    const jar = await cookies();
    const { refreshToken } = body.parse(await jsonBody(request));
    await revokeRefreshToken(refreshToken ?? jar.get(REFRESH_COOKIE)?.value);
    clearSessionCookies(jar);
    return privateOk({ signedOut: true });
  });
}

import { cookies } from "next/headers";
import { z } from "zod";
import { handle, jsonBody } from "@/app/api/v1/_lib/handle";
import { REFRESH_COOKIE, setSessionCookies } from "@/lib/auth/cookies";
import { privateOk } from "@/server/lib/http";
import { refreshSession } from "@/server/services/auth";

const body = z.object({ refreshToken: z.string().optional() });

/** New token pair for a refresh token (body, or the website's cookie). The old refresh token stops working. */
export function POST(request: Request) {
  return handle(async () => {
    const jar = await cookies();
    const { refreshToken } = body.parse(await jsonBody(request));
    const result = await refreshSession(refreshToken ?? jar.get(REFRESH_COOKIE)?.value);
    setSessionCookies(jar, result);
    return privateOk(result);
  });
}

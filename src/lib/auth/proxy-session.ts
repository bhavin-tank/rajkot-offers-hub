import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, secondsLeft } from "./cookies";
import { refreshTokens } from "./session";

/**
 * Pages that read the session can't set cookies, so the proxy renews an
 * expired access token first, writing the new pair onto the request (for this
 * render) and returning it for the response. "signed-out" when the refresh
 * token was refused.
 */
export async function renewSession(request: NextRequest) {
  if (secondsLeft(request.cookies.get(ACCESS_COOKIE)?.value) > 10) return null;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;
  try {
    const tokens = await refreshTokens(refresh);
    request.cookies.set(ACCESS_COOKIE, tokens.access_token);
    request.cookies.set(REFRESH_COOKIE, tokens.refresh_token);
    return tokens;
  } catch {
    request.cookies.delete(ACCESS_COOKIE);
    request.cookies.delete(REFRESH_COOKIE);
    return "signed-out" as const;
  }
}

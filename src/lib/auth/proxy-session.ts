import type { NextRequest } from "next/server";
import { refreshSession, verifyAccessToken, type Tokens } from "@/server/services/auth";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "./cookies";

/**
 * Admin pages read the session in Server Components, which can't set cookies,
 * so the proxy renews an expired access token before the page renders.
 *
 * Returns new tokens (also written onto `request` so this render sees them),
 * "signed-out" when the refresh token is no good, or null when nothing changed.
 */
export async function renewSession(request: NextRequest): Promise<Tokens | "signed-out" | null> {
  if (await verifyAccessToken(request.cookies.get(ACCESS_COOKIE)?.value)) return null;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;
  try {
    const tokens = await refreshSession(refreshToken);
    request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
    if (tokens.refreshToken) request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
    return tokens;
  } catch {
    request.cookies.delete(ACCESS_COOKIE);
    request.cookies.delete(REFRESH_COOKIE);
    return "signed-out";
  }
}

import { ACCESS_TTL, REFRESH_TTL, type Tokens } from "@/server/services/auth";

/** Cookie names for the web session. API clients send `Authorization: Bearer <accessToken>` instead. */
export const ACCESS_COOKIE = "ro_at";
export const REFRESH_COOKIE = "ro_rt";

interface CookieWriter {
  set(name: string, value: string, options: Record<string, unknown>): unknown;
  delete(name: string): unknown;
}

function options(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}

/** Writes the session cookies; works with `cookies()` and with a response's cookies. */
export function setSessionCookies(jar: CookieWriter, tokens: Pick<Tokens, "accessToken" | "refreshToken">) {
  jar.set(ACCESS_COOKIE, tokens.accessToken, options(ACCESS_TTL));
  if (tokens.refreshToken) jar.set(REFRESH_COOKIE, tokens.refreshToken, options(REFRESH_TTL));
}

export function clearSessionCookies(jar: CookieWriter) {
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

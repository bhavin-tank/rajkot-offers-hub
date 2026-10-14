import { cookies } from "next/headers";
import { connection } from "next/server";
import { api, ApiError } from "@/lib/api/client";
import type { ApiUser } from "@/lib/api/types";
import { visitorIp } from "@/lib/api/visitor";
import { ACCESS_COOKIE, clearSessionCookies, REFRESH_COOKIE, secondsLeft, setSessionCookies } from "./cookies";

/** Swaps the refresh token for a new pair (both rotate). `client` is the visitor's IP. */
export async function refreshTokens(refreshToken: string, client: string | null) {
  return api<{ access_token: string; refresh_token: string; expires_in: number }>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
    client,
  });
}

/**
 * The access token for this request. In a server action an expired one is
 * renewed here (actions can set cookies); pages rely on the proxy having done it.
 */
export async function accessToken({ renew = false } = {}): Promise<string | undefined> {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  if (secondsLeft(access) > 10) return access;
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (!renew || !refresh) return undefined;
  try {
    const tokens = await refreshTokens(refresh, await visitorIp());
    setSessionCookies(jar, tokens);
    return tokens.access_token;
  } catch {
    clearSessionCookies(jar);
    return undefined;
  }
}

/** Runs a signed-in API call from a server action, renewing the token once if the API says it lapsed. */
export async function withSession<T>(call: (token: string) => Promise<T>): Promise<T | "signed-out"> {
  const token = await accessToken({ renew: true });
  if (!token) return "signed-out";
  try {
    return await call(token);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const jar = await cookies();
    const refresh = jar.get(REFRESH_COOKIE)?.value;
    if (!refresh) return "signed-out";
    try {
      const tokens = await refreshTokens(refresh, await visitorIp());
      setSessionCookies(jar, tokens);
      return await call(tokens.access_token);
    } catch {
      clearSessionCookies(jar);
      return "signed-out";
    }
  }
}

export type SessionState = { status: "signed-out" } | { status: "mpin-required"; user: ApiUser | null } | { status: "signed-in"; user: ApiUser };

/** Who is signed in, for pages. Always request-time. */
export async function getSession(): Promise<SessionState> {
  await connection();
  const token = await accessToken();
  if (!token) return { status: "signed-out" };
  try {
    const { data } = await api<{ data: ApiUser }>("/user/profile", { token });
    return { status: "signed-in", user: data };
  } catch (error) {
    if (error instanceof ApiError && error.code === "MPIN_SETUP_REQUIRED") return { status: "mpin-required", user: null };
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return { status: "signed-out" };
    throw error;
  }
}

/** A same-site path to return to after login, or the account page. */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/account";
}

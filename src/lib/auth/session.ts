import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ADMIN_ROLES, userForAccessToken, type AuthUser, type RequestMeta } from "@/server/services/auth";
import { ACCESS_COOKIE } from "./cookies";

export { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies, setSessionCookies } from "./cookies";

/** Client IP and user agent of the current request (server components and actions). */
export async function currentRequestMeta(): Promise<RequestMeta> {
  return requestMetaFrom(await headers());
}

export function requestMetaFrom(h: Headers): RequestMeta {
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return { ip, userAgent: h.get("user-agent") ?? "" };
}

/** The signed-in user of this request, or null. The proxy has already refreshed an expired access token. */
export async function getSessionUser(): Promise<AuthUser | null> {
  // Checking a token reads the clock and the database: always at request time, never prerendered.
  await connection();
  return userForAccessToken((await cookies()).get(ACCESS_COOKIE)?.value);
}

export function isAdmin(user: AuthUser | null): user is AuthUser {
  return Boolean(user && ADMIN_ROLES.includes(user.role));
}

/** The signed-in admin, or a redirect to the admin sign-in page. */
export async function requireAdminUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!isAdmin(user)) redirect("/admin/sign-in");
  return user;
}

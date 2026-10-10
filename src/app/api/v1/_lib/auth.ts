import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { requestMetaFrom } from "@/lib/auth/session";
import { AppError } from "@/server/lib/errors";
import { ADMIN_ROLES, userForAccessToken, type AuthUser } from "@/server/services/auth";
import { handle } from "./handle";

/** Bearer token first (API clients), then the web session cookie. */
function accessTokenOf(request: Request) {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${ACCESS_COOKIE}=([^;]+)`))?.[1];
}

export async function requireApiAdmin(request: Request): Promise<AuthUser> {
  const user = await userForAccessToken(accessTokenOf(request));
  if (!user) throw new AppError("UNAUTHENTICATED", "Sign in to continue");
  if (!ADMIN_ROLES.includes(user.role)) throw new AppError("FORBIDDEN", "Admins only");
  return user;
}

export const metaOf = (request: Request) => requestMetaFrom(request.headers);

/** A route handler for admins: checks the caller, then runs `run` inside the error envelope. */
export function adminRoute<Ctx = unknown>(run: (actor: AuthUser, request: Request, ctx: Ctx) => Promise<Response>) {
  return (request: Request, ctx: Ctx) => handle(async () => run(await requireApiAdmin(request), request, ctx));
}

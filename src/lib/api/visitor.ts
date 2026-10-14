import { headers } from "next/headers";
import { isIP } from "node:net";

/**
 * The visitor's IP as the host in front of this server reports it (`x-real-ip` on Vercel and
 * nginx, else the first `x-forwarded-for` hop). Request-time only: server actions and pages
 * outside any cache.
 */
export async function visitorIp(): Promise<string | null> {
  const list = await headers();
  return pickIp(list.get("x-real-ip"), list.get("x-forwarded-for"));
}

export function pickIp(realIp: string | null, forwardedFor: string | null): string | null {
  const candidate = realIp?.trim() || forwardedFor?.split(",")[0]?.trim();
  return candidate && isIP(candidate) ? candidate : null;
}

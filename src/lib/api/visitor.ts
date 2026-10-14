import { headers } from "next/headers";

/**
 * The visitor's IP as the host in front of this server reports it: `cf-connecting-ip` on
 * Cloudflare, `x-real-ip` on nginx or Vercel, else the first `x-forwarded-for` hop.
 * Request-time only: server actions and pages outside any cache.
 */
export async function visitorIp(): Promise<string | null> {
  const list = await headers();
  return pickIp(list.get("cf-connecting-ip"), list.get("x-real-ip"), list.get("x-forwarded-for"));
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6 = /^[0-9a-f:]+(:\d{1,3}(\.\d{1,3}){3})?$/i;

/** The first header that holds a plain IP address. */
export function pickIp(...values: (string | null)[]): string | null {
  for (const value of values) {
    const candidate = value?.split(",")[0]?.trim();
    if (candidate && (IPV4.test(candidate) || (candidate.includes(":") && IPV6.test(candidate)))) return candidate;
  }
  return null;
}

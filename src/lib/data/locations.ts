import { cacheLife } from "next/cache";
import { cookies } from "next/headers";
import { api, orUndefined } from "@/lib/api/client";
import type { PincodeLookup } from "@/lib/api/types";
import { NEAR_COOKIE, parseNear, type Near } from "@/lib/location";

/** India Post's details for a pincode; undefined when it does not exist. Pincodes rarely change. */
export async function lookupPincode(pincode: string): Promise<PincodeLookup | undefined> {
  "use cache";
  cacheLife("days");
  return (await orUndefined(api<{ data: PincodeLookup }>(`/locations/pincodes/${pincode}`)))?.data;
}

/** The visitor's "near me" location, if they set one. Reads a cookie, so only in dynamic parts of a page. */
export async function getNear(): Promise<Near | undefined> {
  return parseNear((await cookies()).get(NEAR_COOKIE)?.value);
}

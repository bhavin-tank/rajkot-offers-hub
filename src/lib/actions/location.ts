"use server";

import { cookies } from "next/headers";
import { lookupPincode } from "@/lib/data/locations";
import type { MessageKey } from "@/lib/i18n/translate";
import { isInRajkot, NEAR_COOKIE, NEAR_COOKIE_MAX_AGE, serializeNear, type Near } from "@/lib/location";

/**
 * "Near me": the visitor's GPS position or a Rajkot pincode's centre (India Post data
 * from the API), saved in a cookie that lists then sort and measure by.
 */

export type LocationResult = { ok: true } | { ok: false; error: MessageKey };

async function save(near: Near) {
  (await cookies()).set(NEAR_COOKIE, serializeNear(near), {
    // Client code reads it too, for the header pill; it holds nothing but a rounded point.
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: NEAR_COOKIE_MAX_AGE,
  });
}

export async function setGpsLocationAction(lat: number, lng: number): Promise<LocationResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { ok: false, error: "We could not get your location. Enter your pincode instead." };
  if (!isInRajkot({ lat, lng })) return { ok: false, error: "You seem to be outside Rajkot. Enter a Rajkot pincode instead." };
  await save({ lat, lng });
  return { ok: true };
}

export async function setPincodeLocationAction(pincode: string): Promise<LocationResult> {
  const pin = pincode.replace(/\D/g, "");
  if (!/^[1-9]\d{5}$/.test(pin)) return { ok: false, error: "Enter a 6-digit pincode" };
  try {
    const place = await lookupPincode(pin);
    if (!place) return { ok: false, error: "We could not find this pincode" };
    if (place.district.slug !== "rajkot") return { ok: false, error: "We cover Rajkot only for now. Enter a Rajkot pincode." };
    if (place.latitude === null || place.longitude === null) return { ok: false, error: "We could not place this pincode on the map. Try a nearby one." };
    await save({ lat: place.latitude, lng: place.longitude, pincode: pin });
    return { ok: true };
  } catch (error) {
    console.error("[location]", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function clearLocationAction() {
  (await cookies()).delete(NEAR_COOKIE);
}

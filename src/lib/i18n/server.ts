import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { hasLocale, type Locale } from "./config";
import { createT } from "./translate";

/** Locale of the current route, read from the `[lang]` root param. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

/** `t` for the current route, for Server Components. */
export async function getT() {
  return createT(await getLocale());
}

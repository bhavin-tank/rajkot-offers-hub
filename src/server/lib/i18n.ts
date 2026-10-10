import type { Locale } from "@/lib/i18n/config";
import { contentGu } from "@/lib/i18n/content";
import type { I18n } from "../db/models";

/** The text for `locale`, falling back to English when it has no translation. */
export function pick(text: I18n, locale: Locale) {
  return (locale === "gu" ? text.gu : undefined) ?? text.en;
}

/** English text with its Gujarati from the catalog dictionary, when there is one. */
export function withGujarati(en: string): I18n {
  const gu = contentGu[en];
  return gu ? { en, gu } : { en };
}

/** Drops an empty Gujarati value so documents store `{ en }` alone. */
export function cleanI18n(text: { en: string; gu?: string }): I18n {
  return text.gu ? { en: text.en, gu: text.gu } : { en: text.en };
}

const CITY: I18n = { en: "Rajkot", gu: "રાજકોટ" };

/** Full display address: "12, Sample Complex, Kalawad Road, Rajkot 360005". */
export function formatAddress(addressLine: string, postalCode: string, locale: Locale) {
  return `${addressLine}, ${pick(CITY, locale)}${postalCode ? ` ${postalCode}` : ""}`;
}

/** `formatAddress` in every language, for copying onto offers. */
export function addressI18n(addressLine: string, postalCode: string): I18n {
  return { en: formatAddress(addressLine, postalCode, "en"), gu: formatAddress(addressLine, postalCode, "gu") };
}

/** Default "how to redeem" steps and terms for offers created without their own. */
export const DEFAULT_STEPS = ["Visit the store", "Show this offer", "Get the discount on your bill"];
export const DEFAULT_TERMS = [
  "The offer is valid only for in-store purchases.",
  "It cannot be combined with any other offer or discount.",
  "The offer is valid until the end date or while stocks last.",
  "The business's decision is final.",
];
export const DEFAULT_TIMINGS = "10 AM – 9 PM";

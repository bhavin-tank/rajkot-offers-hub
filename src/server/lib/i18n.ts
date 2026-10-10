import type { Locale } from "@/lib/i18n/config";
import type { I18n } from "../db/models";

/** The text for `locale`, falling back to English when it has no translation. */
export function pick(text: I18n, locale: Locale) {
  return (locale === "gu" ? text.gu : undefined) ?? text.en;
}

const CITY: I18n = { en: "Rajkot", gu: "રાજકોટ" };

/** Full display address: "12, Sample Complex, Kalawad Road, Rajkot 360005". */
export function formatAddress(addressLine: string, postalCode: string, locale: Locale) {
  return `${addressLine}, ${pick(CITY, locale)} ${postalCode}`;
}

/** `formatAddress` in every language, for copying onto offers. */
export function addressI18n(addressLine: string, postalCode: string): I18n {
  return { en: formatAddress(addressLine, postalCode, "en"), gu: formatAddress(addressLine, postalCode, "gu") };
}

/**
 * Locale rules shared by the proxy, server components and client
 * components, so this file must stay free of framework imports.
 *
 * English is the default and has no URL prefix ("/offers"); Gujarati
 * lives under "/gu" ("/gu/offers").
 */
export const locales = ["en", "gu"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/**
 * Whether visitors can choose a language. While false the toggle is hidden and
 * the proxy serves English only (/gu URLs and the saved-language cookie are
 * ignored). Set it to true to bring the Gujarati site back.
 */
export const languageSwitchEnabled = false;

/** Cookie that remembers the visitor's chosen language. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Name of each language in its own script, for the language toggle. */
export const localeNames: Record<Locale, string> = { en: "English", gu: "ગુજરાતી" };

export function hasLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

/**
 * Prefixes an internal path with the locale: "/offers?x=1" → "/gu/offers?x=1".
 * Relative ("?sort=x"), hash-only, protocol-relative and external hrefs are
 * returned untouched.
 */
export function localizePath(locale: Locale, href: string) {
  if (locale === defaultLocale || !href.startsWith("/") || href.startsWith("//")) return href;
  const rest = href.slice(1);
  return rest === "" || rest.startsWith("?") || rest.startsWith("#") ? `/${locale}${rest}` : `/${locale}/${rest}`;
}

/** Splits "/gu/offers" into { locale: "gu", path: "/offers" }. */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const [, first, ...rest] = pathname.split("/");
  if (!hasLocale(first)) return { locale: null, path: pathname };
  return { locale: first, path: `/${rest.join("/")}` };
}

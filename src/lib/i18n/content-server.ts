import type { Locale } from "./config";
import { contentGu } from "./content";

/** Gujarati for mock catalog text; English, or any text without an entry, is returned as is. */
export function localizeContent(locale: Locale, text: string) {
  return locale === "gu" ? (contentGu[text] ?? text) : text;
}

import { type Locale } from "./config";
import { gu, type MessageKey } from "./messages";

export type { MessageKey };

export type Vars = Record<string, string | number>;

function interpolate(text: string, vars?: Vars) {
  return vars ? text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match)) : text;
}

/**
 * Builds the `t` function for a locale. The English text is the key, so
 * English renders as written and `gu` supplies the Gujarati. Placeholders
 * look like "{count}".
 */
export function createT(locale: Locale) {
  return function t(key: MessageKey, vars?: Vars): string {
    return interpolate(locale === "gu" ? gu[key] : key, vars);
  };
}

export type T = ReturnType<typeof createT>;

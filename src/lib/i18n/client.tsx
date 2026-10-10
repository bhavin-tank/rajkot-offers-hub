"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { defaultLocale, type Locale } from "./config";
import { createT } from "./translate";

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** `t` for Client Components. */
export function useT() {
  const locale = useLocale();
  return useMemo(() => createT(locale), [locale]);
}

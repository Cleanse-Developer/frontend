"use client";

import { createContext, useContext, useEffect, useState } from "react";
import i18n from "@/lib/i18n";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/locales";
import { initLocale, setLocale as persistLocale } from "@/lib/localeState";

const LocaleContext = createContext(null);

/* Storefront language provider. Mirrors SettingsProvider: seeded from the SSR
   cookie (initialLang) to minimise first-paint flash, then reconciled with the
   client's stored preference on mount. Drives i18next (static UI), the module
   locale state (which the axios interceptor reads to add ?lang), and <html lang>.
   Adding a language needs no change here — it flows from ./locales. */
export function LocaleProvider({ children, initialLang = DEFAULT_LOCALE }) {
  const [lang, setLangState] = useState(normalizeLocale(initialLang));

  // Reconcile with the persisted client preference on mount, and keep the
  // module locale + i18next in sync with the initial value.
  useEffect(() => {
    persistLocale(initialLang); // seed module state from SSR value
    const stored = initLocale(); // localStorage wins if present
    const resolved = normalizeLocale(stored);
    setLangState(resolved);
    persistLocale(resolved);
    if (i18n.language !== resolved) i18n.changeLanguage(resolved);
    if (typeof document !== "undefined") document.documentElement.lang = resolved;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (code) => {
    const resolved = persistLocale(code);
    setLangState(resolved);
    i18n.changeLanguage(resolved);
    if (typeof document !== "undefined") document.documentElement.lang = resolved;
  };

  return (
    <LocaleContext.Provider value={{ lang, setLang }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext) || { lang: DEFAULT_LOCALE, setLang: () => {} };
}

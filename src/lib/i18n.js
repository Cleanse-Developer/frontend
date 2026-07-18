// i18next setup for static UI strings. Dictionaries are bundled (imported) so
// they're available during SSR and the first client render with no async load.
//
// Adding a language: add it to LOCALES in ./locales, create
// src/locales/<code>/common.json, then import + register it in `resources` below.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LOCALE_CODES, DEFAULT_LOCALE } from "./locales";

import enCommon from "@/locales/en/common.json";
import hiCommon from "@/locales/hi/common.json";

const resources = {
  en: { common: enCommon },
  hi: { common: hiCommon },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LOCALE, // LocaleProvider reconciles to the stored language on mount
    fallbackLng: DEFAULT_LOCALE, // missing key/language → English
    supportedLngs: LOCALE_CODES,
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false }, // React already escapes
    react: { useSuspense: false },
  });
}

export default i18n;

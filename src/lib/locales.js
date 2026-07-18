// Single source of truth for storefront languages (frontend side).
// Adding a language = add an entry here. This drives the switcher options and
// i18next's supportedLngs; the `code` must match the backend SUPPORTED_LOCALES.

export const LOCALES = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हि", name: "हिन्दी" }, // add more here
];

export const DEFAULT_LOCALE = "en";

export const LOCALE_CODES = LOCALES.map((l) => l.code);

export const isSupportedLocale = (code) => LOCALE_CODES.includes(code);

export const normalizeLocale = (code) =>
  isSupportedLocale(code) ? code : DEFAULT_LOCALE;

// Module-level current locale, so non-React code (the axios interceptor) can read
// the active language without a hook. LocaleContext is the writer; everything
// else reads. Persists to localStorage + a cookie (the cookie lets the server
// layout SSR-render the right language).
import { DEFAULT_LOCALE, normalizeLocale } from "./locales";

export const LOCALE_STORAGE_KEY = "cleanse-lang";

let current = DEFAULT_LOCALE;

export function getLocale() {
  return current;
}

// Read the persisted preference (client only). Call once on mount.
export function initLocale() {
  if (typeof window === "undefined") return current;
  try {
    current = normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    current = DEFAULT_LOCALE;
  }
  return current;
}

export function setLocale(code) {
  current = normalizeLocale(code);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, current);
    } catch {
      /* storage blocked */
    }
    // 1-year cookie so the SSR layout can pick the language on first paint.
    document.cookie = `${LOCALE_STORAGE_KEY}=${current}; path=/; max-age=31536000; samesite=lax`;
  }
  return current;
}

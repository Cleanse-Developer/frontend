import "./globals.css";
import "@/design-system/styles/index.css";

import ReactDOM from "react-dom";
import { cookies } from "next/headers";
import ClientLayout from "@/client-layout";

import Menu from "@/components/Menu/Menu";
import Footer from "@/components/Footer/Footer";
import ShoppingCart from "@/components/ShoppingCart/ShoppingCart";

import TransitionProvider from "@/providers/TransitionProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { LOCALE_STORAGE_KEY } from "@/lib/localeState";
import { normalizeLocale, DEFAULT_LOCALE } from "@/lib/locales";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import { PopupProvider } from "@/context/PopupContext";
import SpinWheelWrapper from "@/components/SpinWheel/SpinWheelWrapper";
import NewsletterPopupWrapper from "@/components/NewsletterPopup/NewsletterPopupWrapper";

const SITE_NAME = "Cleanse Ayurveda";
const SITE_TITLE = "Cleanse Ayurveda | Premium Ayurvedic Beauty";
const SITE_DESCRIPTION =
  "Discover the ancient wisdom of Ayurveda through our premium skincare and beauty rituals. Handcrafted with pure, natural ingredients.";
// Optional storefront origin. When set, relative share/canonical URLs resolve
// against it; per-route generateMetadata (e.g. blog posts) supplies richer tags.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

export const metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    ...(SITE_URL ? { url: SITE_URL } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// Decide whether the intro loader plays BEFORE the browser paints anything. This is
// a parser-blocking script placed first in <body>, so it runs while the preloader
// markup below is still being parsed: the panel is server-rendered (so it's part of
// the very first paint, with no wait for hydration), and CSS only reveals it when
// this script stamps data-loader="play" on <html>. On a reload or a non-home route
// the attribute is "skip", so the panel never paints at all — no flash either way.
// Keep the key in sync with LOADER_SESSION_KEY in components/Preloader/Preloader.
const LOADER_DECISION_SCRIPT = `
(function () {
  var el = document.documentElement;
  var isHome = location.pathname === "/";
  try {
    if (isHome && !sessionStorage.getItem("cleanse_loader_shown")) {
      sessionStorage.setItem("cleanse_loader_shown", "1");
      el.dataset.loader = "play";
    } else {
      el.dataset.loader = "skip";
    }
  } catch (e) {
    /* sessionStorage blocked (private mode) — play on home, never persist */
    el.dataset.loader = isHome ? "play" : "skip";
  }
})();
`;

// Fetch public settings on the server so CMS-driven content (the hero carousel in
// particular) is present in the initial HTML — no client round-trip, no empty hero.
async function getInitialSettings(lang) {
  try {
    const base =
      process.env.NEXT_PUBLIC_API_URL || "https://d6mvnylha0j3u.cloudfront.net/api";
    // Localized settings on the server so first paint already has the right
    // language. `?lang` is part of the URL, so Next's data cache keys per-language.
    const qs = lang && lang !== DEFAULT_LOCALE ? `?lang=${lang}` : "";
    const res = await fetch(`${base}/settings/public${qs}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = normalizeLocale(cookieStore.get(LOCALE_STORAGE_KEY)?.value);
  const initialSettings = await getInitialSettings(lang);

  // Preload the first hero image at high priority so the browser fetches it during
  // HTML parse (CSS background-images are otherwise deprioritized and load late).
  const heroFirst = initialSettings?.cmsHero?.carouselImages?.[0]?.url;
  if (heroFirst) ReactDOM.preload(heroFirst, { as: "image", fetchPriority: "high" });

  // suppressHydrationWarning: LOADER_DECISION_SCRIPT stamps data-loader onto
  // <html> before React hydrates, so the server markup and the DOM legitimately
  // differ on this element.
  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: LOADER_DECISION_SCRIPT }} />
        <ErrorBoundary>
        <AuthProvider>
        <LocaleProvider initialLang={lang}>
        <SettingsProvider initial={initialSettings}>
        <ToastProvider>
        <CartProvider>
          <PopupProvider>
          <TransitionProvider>
            <ClientLayout footer={<Footer />} header={<Menu />}>
              {children}
            </ClientLayout>
            <ShoppingCart />
            <SpinWheelWrapper />
            <NewsletterPopupWrapper />
          </TransitionProvider>
          </PopupProvider>
        </CartProvider>
        </ToastProvider>
        </SettingsProvider>
        </LocaleProvider>
        </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

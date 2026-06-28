import "./globals.css";
import "@/design-system/styles/index.css";

import ReactDOM from "react-dom";
import ClientLayout from "@/client-layout";

import Menu from "@/components/Menu/Menu";
import Footer from "@/components/Footer/Footer";
import ShoppingCart from "@/components/ShoppingCart/ShoppingCart";

import TransitionProvider from "@/providers/TransitionProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { SettingsProvider } from "@/context/SettingsContext";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import { PopupProvider } from "@/context/PopupContext";
import SpinWheelWrapper from "@/components/SpinWheel/SpinWheelWrapper";
import NewsletterPopupWrapper from "@/components/NewsletterPopup/NewsletterPopupWrapper";

export const metadata = {
  title: "Cleanse Ayurveda | Premium Ayurvedic Beauty",
  description: "Discover the ancient wisdom of Ayurveda through our premium skincare and beauty rituals. Handcrafted with pure, natural ingredients.",
};

// Fetch public settings on the server so CMS-driven content (the hero carousel in
// particular) is present in the initial HTML — no client round-trip, no empty hero.
async function getInitialSettings() {
  try {
    const base =
      process.env.NEXT_PUBLIC_API_URL || "https://d6mvnylha0j3u.cloudfront.net/api";
    const res = await fetch(`${base}/settings/public`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }) {
  const initialSettings = await getInitialSettings();

  // Preload the first hero image at high priority so the browser fetches it during
  // HTML parse (CSS background-images are otherwise deprioritized and load late).
  const heroFirst = initialSettings?.cmsHero?.carouselImages?.[0]?.url;
  if (heroFirst) ReactDOM.preload(heroFirst, { as: "image", fetchPriority: "high" });

  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
        <AuthProvider>
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
        </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

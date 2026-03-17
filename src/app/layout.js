import "./globals.css";

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

export const metadata = {
  title: "Cleanse Ayurveda | Premium Ayurvedic Beauty",
  description: "Discover the ancient wisdom of Ayurveda through our premium skincare and beauty rituals. Handcrafted with pure, natural ingredients.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
        <AuthProvider>
        <SettingsProvider>
        <ToastProvider>
        <CartProvider>
          <TransitionProvider>
            <ClientLayout footer={<Footer />}>
              <Menu />
              {children}
            </ClientLayout>
            <ShoppingCart />
          </TransitionProvider>
        </CartProvider>
        </ToastProvider>
        </SettingsProvider>
        </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

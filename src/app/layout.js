import "./globals.css";
import { Koulen, DM_Mono, Host_Grotesk, Lexend } from "next/font/google";

import ClientLayout from "@/client-layout";

import Menu from "@/components/Menu/Menu";
import Footer from "@/components/Footer/Footer";
import ShoppingCart from "@/components/ShoppingCart/ShoppingCart";
import TransitionProvider from "@/providers/TransitionProvider";

const koulen = Koulen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-koulen",
});

const hostGrotesk = Host_Grotesk({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-host-grotesk",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

const lexend = Lexend({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata = {
  title: "Cleanse Ayurveda | Premium Ayurvedic Beauty",
  description: "Discover the ancient wisdom of Ayurveda through our premium skincare and beauty rituals. Handcrafted with pure, natural ingredients.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${koulen.variable} ${hostGrotesk.variable} ${dmMono.variable} ${lexend.variable}`}
      >
        <TransitionProvider>
          <ClientLayout footer={<Footer />}>
            <Menu />
            {children}
          </ClientLayout>
          <ShoppingCart />
        </TransitionProvider>
      </body>
    </html>
  );
}

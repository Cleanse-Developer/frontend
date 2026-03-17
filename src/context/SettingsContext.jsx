"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { settingsApi } from "@/lib/endpoints";

const SettingsContext = createContext(null);

const DEFAULTS = {
  promoBanner: {
    enabled: true,
    messages: [
      "100% NATURAL INGREDIENTS",
      "FREE SHIPPING ON ORDERS ABOVE Rs.1200",
      "AYURVEDIC & DOCTOR APPROVED",
    ],
  },
  freeShippingThreshold: 1200,
  socialLinks: {
    instagram: "https://www.instagram.com/cleanseayurveda/",
    twitter: "https://x.com/cleanseayurveda",
    youtube: "https://www.youtube.com/@cleanseayurveda",
  },
  whatsappNumber: "",
  spinWheelEnabled: true,
  newsletterPopupEnabled: true,
  // CMS section defaults (match backend CMS_DEFAULTS)
  cmsHero: {
    title: "Cleanse Ayurveda",
    subtitle: "Natural Skin Care for Mindful Living",
    ctaText: "Shop Now",
    ctaLink: "/wardrobe",
    backgroundImage: null,
  },
  cmsFormula: {
    tagline:
      "We aren\u2019t merely selling bottles; we are delivering a clinically-backed path to purity.",
    centerImage: null,
    boxes: [
      { position: "tl", icon: "users", title: "Proven by\npeople like you", description: "In real-world tests, 94% of users saw noticeable skin improvements within 28 days." },
      { position: "tr", icon: "leaf", title: "Proven by\npeople like you", description: "In real-world tests, 94% of users saw noticeable skin improvements within 28 days." },
      { position: "bl", icon: "leaf", title: "Proven by\npeople like you", description: "In real-world tests, 94% of users saw noticeable skin improvements within 28 days." },
      { position: "br", icon: "star", title: "Proven by\npeople like you", description: "In real-world tests, 94% of users saw noticeable skin improvements within 28 days." },
    ],
  },
  cmsMarquee: {
    marqueeLines: [
      "Ancient wisdom meets modern beauty",
      "Pure ingredients for radiant skin",
      "Timeless rituals for glowing skin",
    ],
    sectionHeader: "VIEW TRENDING",
    instagramHandle: "@CleanseAyurveda",
    instagramUrl: "https://www.instagram.com/cleanseayurveda/",
    reels: [
      { title: "Morning Ritual", subtitle: "Golden Hour Glow", video: null, posterImage: null, position: "left-top" },
      { title: "Sacred Rituals", subtitle: "Embrace Your Natural Glow", video: null, posterImage: null, position: "center" },
      { title: "Evening Care", subtitle: "Restore & Rejuvenate", video: null, posterImage: null, position: "right-bottom" },
    ],
  },
  cmsBento: {
    sectionTitle: "Why your skin deserves the best?",
    ratingText: "4+ Star Ratings",
    leftCard: { image: null, label: "100% AYURVEDIC", description: "Lab tested products for all skin types and all age groups" },
    ingredientsCard: { image: null, heading: "5 AYURVEDIC INGREDIENTS", description: "lorem sit officia sint esse veniam aliquip ullamco ea consequat aute in consectetur exercitation quis do lorem veniam mollit ut nostrud commodo aute" },
    featuredProductIds: [],
    featuredProducts: [],
  },
  cmsCta: {
    image: null,
    heading: "Ancient Secrets, Modern Radiance",
    description: "Infused with Turmeric and Rose Petals.",
    ctaText: "SHOP NOW",
    ctaLink: "/wardrobe",
  },
  cmsPeelReveal: {
    headerTexts: ["Ritual: Sacred", "Formula: Ayurveda_001"],
    footerText: "Source: Himalayan",
    image: null,
    heading: "Ancient Secrets, Modern Radiance",
    introTexts: ["Shop", "Now"],
  },
  cmsHeader: {
    logoImage: null,
    navLinks: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/wardrobe" },
      { label: "About", href: "/genesis" },
      { label: "Blog", href: "/blog" },
    ],
    socialLinks: {
      twitter: "https://x.com/cleanseayurveda",
      instagram: "https://www.instagram.com/cleanseayurveda/",
      youtube: "https://www.youtube.com/@cleanseayurveda",
    },
  },
  cmsFooter: {
    navigationLinks: [
      { label: "HAIR CARE", href: "/wardrobe?category=Hair Care" },
      { label: "BODY CARE", href: "/wardrobe?category=Body Care" },
      { label: "FACE CARE", href: "/wardrobe?category=Face Care" },
      { label: "ABOUT US", href: "/genesis" },
    ],
    socialLinks: {
      instagram: "https://www.instagram.com/cleanseayurveda/",
      twitter: "https://twitter.com",
      facebook: "https://facebook.com",
      youtube: "https://www.youtube.com/@cleanseayurveda",
    },
    copyrightText: "2026 CLEANSE AYURVEDA . ALL RIGHTS RESERVED",
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    settingsApi
      .getPublic()
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) return DEFAULTS;
  return ctx;
}

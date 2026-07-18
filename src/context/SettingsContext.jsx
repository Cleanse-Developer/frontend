"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { settingsApi } from "@/lib/endpoints";
import { useLocale } from "@/context/LocaleContext";

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
  newsletterPopupConfig: {
    tag: "JOIN OUR COMMUNITY",
    heading: "Get 10% Off",
    description:
      "Subscribe to our newsletter and receive exclusive offers, Ayurvedic tips, and new product updates.",
    note: "No spam, unsubscribe anytime.",
    image: null,
    delaySeconds: 8,
  },
  // CMS section defaults (match backend CMS_DEFAULTS)
  cmsHero: {
    title: "Cleanse Ayurveda",
    subtitle: "Natural Skin Care for Mindful Living",
    ctaText: "Shop Now",
    ctaLink: "/wardrobe",
    carouselImages: [],
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
    image: null,
    heading: "Ancient Secrets, Modern Radiance",
    introTexts: ["Shop", "Now"],
    ctaText: "SHOP NOW",
    ctaLink: "/wardrobe",
  },
  // Shipping / Returns are rendered by <LegalPage>. Unlike cmsPrivacy/cmsTerms
  // (CMS-only, empty until authored), these ship with copy so the footer links
  // always land on a page with real information. Every line below restates a
  // commitment the site already makes elsewhere — the touchpoint FAQ, the
  // product-page policies block, and freeShippingThreshold above.
  cmsShipping: {
    breadcrumbLabel: "SHIPPING",
    heroTitle: "Shipping",
    subtitle: "Where we ship, how long it takes, and what it costs.",
    sections: [
      {
        heading: "Order Processing",
        body: "Orders are packed and dispatched within 2-3 business days of being placed.\n\nOrders placed on a weekend or a public holiday are processed on the next business day.",
      },
      {
        heading: "Delivery Times",
        body: "Once dispatched, delivery takes 5-7 days across India and 10-14 days for international orders.\n\nThese are estimates from the courier, not guarantees — remote pin codes and customs clearance can add time.",
      },
      {
        heading: "Shipping Charges",
        body: "Shipping is free on all orders above ₹1200 within India.\n\nInternational shipping is calculated at checkout based on your delivery location, so you will always see the exact cost before you pay.",
      },
      {
        heading: "Where We Ship",
        body: "We ship worldwide.\n\nAny customs duties or import taxes charged by your country are set by that country and are payable by you on delivery.",
      },
      {
        heading: "Tracking Your Order",
        body: "You can follow the status of every order from the Orders page in your account.\n\nIf anything looks wrong with your delivery, get in touch through our Contact page and we will look into it.",
      },
    ],
  },
  cmsReturns: {
    breadcrumbLabel: "RETURNS",
    heroTitle: "Returns",
    subtitle: "Our return window, how to start one, and how refunds work.",
    sections: [
      {
        heading: "Our Return Window",
        body: "We offer a 7-day return policy on unopened products, counted from the day your order is delivered.",
      },
      {
        heading: "What We Can Accept",
        body: "Products must be unopened and in their original packaging, with any seals intact.\n\nBecause these are skincare products applied directly to the body, we cannot resell an opened item — so opened products fall outside the return window.",
      },
      {
        heading: "How To Start A Return",
        body: "Open the Orders page in your account and choose Return / Refund on the order you want to send back.\n\nYou can also reach our support team through the Contact page and we will start it for you.",
      },
      {
        heading: "Refunds",
        body: "Once your return is approved, we initiate the refund and the order moves through to refunded.\n\nYou can follow each of those steps from the Orders page, so you always know where your refund has reached.",
      },
      {
        heading: "Damaged Or Incorrect Items",
        body: "If your order arrives damaged, or is not what you ordered, contact us through the Contact page as soon as you can.\n\nSend a photo of the item and your order number and we will make it right.",
      },
    ],
  },
  cmsTestimonials: {
    heading: "Stories from\nour ritual",
    reviewCtaText: "Used our products? We'd love to hear from you.",
    reviewCtaButton: "Write a Review",
  },
  cmsRitualBanner: {
    enabled: true,
    heading: "Find your ritual",
    subtitle:
      "Skincare, slowed down. Two unhurried ceremonies, one to greet the morning, one to release the night, each made with Cleanse.",
    cards: [
      {
        key: "am",
        icon: "sun",
        eyebrow: "Morning",
        title: "Awaken",
        subtitle: "The morning ritual",
        meta: "4 steps · ~5 min",
        desc: "Wake the skin gently, brighten it, and shield it against the day ahead.",
        steps: ["Cleanse", "Hydrate", "Hair", "Body"],
        linkText: "Begin the morning",
        href: "/ritual",
        image: { url: "/face.jpg", publicId: null },
      },
      {
        key: "pm",
        icon: "moon",
        eyebrow: "Evening",
        title: "Restore",
        subtitle: "The evening ritual",
        meta: "4 steps · ~8 min",
        desc: "Undo the day, then let precious botanicals repair your skin as you sleep.",
        steps: ["Cleanse", "Nourish", "Replenish", "Hair"],
        linkText: "Begin the evening",
        href: "/ritual#evening",
        image: { url: "/skin.jpg", publicId: null },
      },
    ],
    ctaText: "Explore the full ritual",
    ctaLink: "/ritual",
  },
  // cmsRitualPage / cmsGenesis are deliberately absent, like cmsTerms and
  // cmsPrivacy: whole-page sections are served by the backend's CMS_DEFAULTS
  // and their pages tolerate an empty shape. Mirroring ~250 lines of page copy
  // here would only add a third place for it to drift out of sync.
  cmsWardrobe: {
    spotlightImage: null,
    spotlightTitle: "Ayurvedic care, real results",
    spotlightCtaText: "Shop the collection",
    spotlightCtaLink: "/wardrobe",
    sideImage: null,
    sideTitle: "Clinically-backed, rooted in Ayurveda",
    sideCtaText: "Discover the ritual",
    sideCtaLink: "/ritual",
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
    supportLinks: [
      { label: "Contact Us", href: "/touchpoint" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
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

export function SettingsProvider({ children, initial }) {
  // `initial` is fetched server-side in the root layout so CMS data (incl. the hero
  // carousel) is present on the very first paint — no empty-hero flash. We still
  // revalidate on the client to pick up any changes.
  const [settings, setSettings] = useState(
    initial ? { ...DEFAULTS, ...initial } : DEFAULTS
  );

  // Refetch whenever the language changes — the axios interceptor adds ?lang, so
  // the storefront swaps to that language's CMS content (English fallback per field).
  const { lang } = useLocale();
  useEffect(() => {
    settingsApi
      .getPublic()
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {
        /* keep defaults */
      });
  }, [lang]);

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

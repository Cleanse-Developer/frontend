import Link from "next/link";
import Logo from "@/components/Logo/Logo";

/* Content laid over the shop's in-grid banners. Without it they're bare product
   photography with no brand mark and nothing to click — which is what made them
   read as filler next to the product cards.

   Logo and headline sit at the top, the CTA at the bottom. A scrim behind each
   end keeps the text legible whatever the photo does underneath, and the middle
   stays clear so the product shot is still the hero. */
const BannerOverlay = ({ title, ctaText = "Shop the collection", ctaLink = "/wardrobe" }) => (
  <div className="banner-overlay">
    <div className="banner-overlay-head">
      <Logo className="banner-overlay-logo" imgClassName="banner-overlay-logo-img" />
      {title ? <p className="banner-overlay-title">{title}</p> : null}
    </div>

    <Link href={ctaLink} className="banner-overlay-cta">
      <span>{ctaText}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  </div>
);

export default BannerOverlay;

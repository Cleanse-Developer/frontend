"use client";
import "./Footer.css";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

import ContactForm from "../ContactForm/ContactForm";
import Logo from "@/components/Logo/Logo";

// Footer link labels can come from the CMS in ALL CAPS — render them in
// Title Case so the footer links read small, not shouty.
const titleCase = (s = "") =>
  s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const Footer = () => {
  const settings = useSettings();
  const cmsFooter = settings.cmsFooter || {};
  const navLinks = cmsFooter.navigationLinks || [
    { label: "Hair Care", href: "/wardrobe?category=hair-care" },
    { label: "Body Care", href: "/wardrobe?category=body-care" },
    { label: "Face Care", href: "/wardrobe?category=face-care" },
    { label: "About Us", href: "/genesis" },
  ];
  const socialLinks = cmsFooter.socialLinks || {
    instagram: "https://www.instagram.com/cleanseayurveda/",
    twitter: "https://twitter.com",
    facebook: "https://facebook.com",
    youtube: "https://www.youtube.com/@cleanseayurveda",
  };
  const copyrightText = cmsFooter.copyrightText || "2026 CLEANSE AYURVEDA . ALL RIGHTS RESERVED";

  const contact = cmsFooter.contact || {};
  const addressLines = contact.addressLines || [
    "Cleanse Ayurveda Pvt. Ltd.",
    "42 Wellness Avenue, Bandra West, Mumbai 400050",
  ];
  const email = contact.email || "care@cleanseayurveda.com";
  const phone = contact.phone || "+91 80000 00000";

  return (
    <>
      <ContactForm />

      <footer>
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-pages">
              <h3 className="footer-pages-title">SHOP</h3>
              <div className="footer-pages-links">
                {navLinks.map((link, i) => (
                  <Link key={i} href={link.href}>{titleCase(link.label)}</Link>
                ))}
              </div>
            </div>

            <div className="footer-pages">
              <h3 className="footer-pages-title">DISCOVER</h3>
              <div className="footer-pages-links">
                <Link href="/genesis">Our Genesis</Link>
                <Link href="/lookbook">Lookbook</Link>
                <Link href="/blog">Journal</Link>
                <Link href="/touchpoint">Touchpoint</Link>
              </div>
            </div>

            <div className="footer-pages">
              <h3 className="footer-pages-title">ACCOUNT</h3>
              <div className="footer-pages-links">
                <Link href="/profile">My Profile</Link>
                <Link href="/orders">My Orders</Link>
                <Link href="/cart">Shopping Bag</Link>
                <Link href="/login">Sign In</Link>
              </div>
            </div>

            <div className="footer-pages">
              <h3 className="footer-pages-title">SUPPORT</h3>
              <div className="footer-pages-links">
                <Link href="/touchpoint">Contact Us</Link>
                <Link href="/touchpoint#shipping">Shipping</Link>
                <Link href="/touchpoint#returns">Returns</Link>
                <Link href="/touchpoint#faq">FAQ</Link>
              </div>
            </div>
          </div>

          <Logo src="/logo.png" className="footer-logo-mark" imgClassName="footer-logo" />

          <address className="footer-contact">
            {addressLines.map((line, i) => (
              <span key={i} className="footer-contact-line">{line}</span>
            ))}
            <span className="footer-contact-line footer-contact-actions">
              <a href={`mailto:${email}`}>{email}</a>
              <span className="footer-contact-sep">•</span>
              <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
            </span>
          </address>

          <div className="footer-divider"></div>

          <div className="footer-legal">
            <p className="footer-copyright">&copy;{copyrightText}</p>
            <div className="footer-socials">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer">{platform.toUpperCase()}</a>
              ))}
            </div>
            <div className="footer-legal-links">
              <Link href="/terms">TERMS OF SERVICE</Link>
              <Link href="/privacy">PRIVACY POLICY</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

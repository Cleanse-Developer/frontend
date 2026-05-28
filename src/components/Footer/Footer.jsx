"use client";
import "./Footer.css";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

import ContactForm from "../ContactForm/ContactForm";

const Footer = () => {
  const settings = useSettings();
  const cmsFooter = settings.cmsFooter || {};
  const navLinks = cmsFooter.navigationLinks || [
    { label: "HAIR CARE", href: "/wardrobe?category=Hair Care" },
    { label: "BODY CARE", href: "/wardrobe?category=Body Care" },
    { label: "FACE CARE", href: "/wardrobe?category=Face Care" },
    { label: "ABOUT US", href: "/genesis" },
  ];
  const socialLinks = cmsFooter.socialLinks || {
    instagram: "https://www.instagram.com/cleanseayurveda/",
    twitter: "https://twitter.com",
    facebook: "https://facebook.com",
    youtube: "https://www.youtube.com/@cleanseayurveda",
  };
  const copyrightText = cmsFooter.copyrightText || "2026 CLEANSE AYURVEDA . ALL RIGHTS RESERVED";

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
                  <Link key={i} href={link.href}>{link.label}</Link>
                ))}
              </div>
            </div>

            <div className="footer-pages">
              <h3 className="footer-pages-title">DISCOVER</h3>
              <div className="footer-pages-links">
                <Link href="/genesis">OUR GENESIS</Link>
                <Link href="/lookbook">LOOKBOOK</Link>
                <Link href="/blog">JOURNAL</Link>
                <Link href="/touchpoint">TOUCHPOINT</Link>
              </div>
            </div>

            <div className="footer-pages">
              <h3 className="footer-pages-title">ACCOUNT</h3>
              <div className="footer-pages-links">
                <Link href="/profile">MY PROFILE</Link>
                <Link href="/orders">MY ORDERS</Link>
                <Link href="/cart">SHOPPING BAG</Link>
                <Link href="/login">SIGN IN</Link>
              </div>
            </div>

            <div className="footer-pages">
              <h3 className="footer-pages-title">SUPPORT</h3>
              <div className="footer-pages-links">
                <Link href="/touchpoint">CONTACT US</Link>
                <Link href="/touchpoint#shipping">SHIPPING</Link>
                <Link href="/touchpoint#returns">RETURNS</Link>
                <Link href="/touchpoint#faq">FAQ</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <img src="/logo.png" alt="Cleanse" className="footer-logo" />
            <div className="footer-socials">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer">{platform.toUpperCase()}</a>
              ))}
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-legal">
            <p className="footer-copyright">&copy;{copyrightText}</p>
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

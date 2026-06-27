"use client";
import { useState } from "react";
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
  // Mobile accordion: which footer column is expanded (null = all collapsed).
  // On desktop the columns reveal on hover (CSS), so this only drives mobile.
  const [openSection, setOpenSection] = useState(null);
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

  // Footer link columns — same content as desktop, mapped so each can act as a
  // collapsible dropdown on mobile.
  const sections = [
    {
      title: "Shop",
      links: navLinks.map((l) => ({ label: titleCase(l.label), href: l.href })),
    },
    {
      title: "Discover",
      links: [
        { label: "Our Genesis", href: "/genesis" },
        { label: "Lookbook", href: "/lookbook" },
        { label: "Journal", href: "/blog" },
        { label: "Touchpoint", href: "/touchpoint" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "My Profile", href: "/profile" },
        { label: "My Orders", href: "/orders" },
        { label: "Shopping Bag", href: "/cart" },
        { label: "Sign In", href: "/login" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact Us", href: "/touchpoint" },
        { label: "Shipping", href: "/touchpoint#shipping" },
        { label: "Returns", href: "/touchpoint#returns" },
        { label: "FAQ", href: "/touchpoint#faq" },
      ],
    },
  ];

  // Real brand glyphs for the social row, rendered in brown (currentColor).
  const socialIcons = {
    instagram: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.12 1.38C1.36 2.67.95 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.12.66.66 1.33 1.07 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.12-1.38.66-.66 1.07-1.33 1.38-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.12-.66-.66-1.33-1.07-2.12-1.38-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z" />
        <path d="M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
        <circle cx="18.41" cy="5.59" r="1.44" />
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3L17.61 20.65z" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
      </svg>
    ),
    youtube: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
      </svg>
    ),
  };

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
            {sections.map((sec, i) => (
              <div
                key={sec.title}
                className={`footer-pages${openSection === i ? " footer-pages-open" : ""}`}
              >
                <h3
                  className="footer-pages-title"
                  onClick={() => setOpenSection(openSection === i ? null : i)}
                >
                  {sec.title}
                </h3>
                <div className="footer-pages-links">
                  {sec.links.map((link, j) => (
                    <Link key={j} href={link.href}>{link.label}</Link>
                  ))}
                </div>
              </div>
            ))}
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
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform}
                  className="footer-social-icon"
                >
                  {socialIcons[platform] || platform.toUpperCase()}
                </a>
              ))}
            </div>
            <div className="footer-legal-links">
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

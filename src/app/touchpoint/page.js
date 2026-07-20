"use client";
import "./touchpoint.css";
import { useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { contactApi } from "@/lib/endpoints";
import { useSettings } from "@/context/SettingsContext";

// Fallbacks only — the real content is CMS-driven (settings.cmsContact). These
// match the seeded defaults so the page still renders if settings haven't loaded.
const FALLBACK_FAQS = [
  { q: "What are your shipping times?", a: "We ship within 2-3 business days. Delivery takes 5-7 days across India and 10-14 days internationally." },
  { q: "Do you offer returns?", a: "Yes, we offer a 7-day return policy on unopened products. Contact our support team to initiate a return." },
  { q: "Are your products 100% natural?", a: "All Cleanse products are made with pure, ethically sourced Ayurvedic ingredients with no synthetic additives." },
  { q: "Do you ship internationally?", a: "Yes, we ship worldwide. International shipping charges are calculated at checkout based on your location." },
];
const FALLBACK_SUBJECTS = ["Order Inquiry", "Product Question", "Returns & Exchanges", "Wholesale & Partnerships", "Other"];

// Render a string with "\n" as line breaks.
const lines = (s) => String(s || "").split("\n").flatMap((t, i) => (i ? [<br key={i} />, t] : [t]));

export default function Touchpoint() {
  const settings = useSettings();
  const c = settings?.cmsContact || {};
  // Email, phone AND address all come from the one admin-editable
  // `cmsFooter.contact` block the footer reads, so the two surfaces can never
  // advertise different details. Phone and location used to be hardcoded here,
  // which is why this page showed a number the footer didn't. Fallbacks match
  // the footer's exactly.
  const info = settings?.cmsFooter?.contact || {};
  const supportEmail = info.email || "hello@cleanseayurveda.com";
  const supportPhone = info.phone || "+91 80000 00000";
  const addressLines = info.addressLines || [
    "HRBD Life Sciences Pvt. Ltd.",
    "42 Wellness Avenue, Bandra West, Mumbai 400050",
  ];
  // "Visit Us" wants a short place, not the full postal address: use the last
  // address line (the one carrying the city) and trim any postcode.
  const visitLocation =
    (addressLines[addressLines.length - 1] || "")
      .split(",")
      .map((part) => part.trim())
      // Drop empties and a bare postcode, so the last two parts are real
      // place names ("South Delhi, Delhi") rather than "Delhi, 110048".
      .filter((part) => part && !/^\d{4,8}$/.test(part))
      .slice(-2)
      .join(", ") || "Mumbai, Maharashtra";
  const faqs = c.faqs?.length ? c.faqs : FALLBACK_FAQS;
  const subjectOptions = c.subjectOptions?.length ? c.subjectOptions : FALLBACK_SUBJECTS;
  const heroRef = useRef(null);
  const cardsRef = useRef([]);
  const formRef = useRef(null);
  const faqRefs = useRef([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({ name: "", lastName: "", email: "", subject: "", message: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !formData.name || !formData.email || !formData.message) return;
    setSubmitting(true);
    try {
      await contactApi.submit({
        name: `${formData.name} ${formData.lastName}`.trim(),
        email: formData.email,
        subject: formData.subject || "General Inquiry",
        message: formData.message,
        // Honeypot — hidden from humans; if a bot fills it the server drops it.
        website: formData.website,
      });
      setSubmitted(true);
      setFormData({ name: "", lastName: "", email: "", subject: "", message: "" });
    } catch {
      // Silent fail -- form still resets
    } finally {
      setSubmitting(false);
    }
  };

  useGSAP(() => {
    gsap.fromTo(
      cardsRef.current.filter(Boolean),
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out", delay: 0.3 }
    );
  });

  return (
    <div className="touchpoint-page">
      {/* Hero - Full screen centered */}
      <section className="touchpoint-hero" ref={heroRef}>
        <div className="touchpoint-hero-bg">
          <img src={c.heroImage?.url || "/images/b2.png"} alt="" />
        </div>
        <div className="touchpoint-hero-content">
          <div className="touchpoint-breadcrumb">
            <Link href="/">HOME</Link>/ <span>CONTACT</span>
          </div>
          <h1 className="touchpoint-hero-title">{lines(c.heroTitle || "LET'S\nCONNECT")}</h1>
          <p className="touchpoint-hero-subtitle">
            {c.heroSubtitle || "We're here to guide your wellness journey with ancient wisdom and modern care."}
          </p>
          <div className="touchpoint-hero-scroll">
            <span>Scroll</span>
            <div className="touchpoint-scroll-line"></div>
          </div>
        </div>
      </section>

      {/* Contact Info Strip */}
      <section className="touchpoint-info-strip">
        <div
          className="touchpoint-info-item"
          ref={(el) => (cardsRef.current[0] = el)}
          style={{ opacity: 0 }}
        >
          <div className="touchpoint-info-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div className="touchpoint-info-text">
            <span className="touchpoint-info-label">Email Us</span>
            <a href={`mailto:${supportEmail}`} className="touchpoint-info-value">{supportEmail}</a>
          </div>
        </div>

        <div className="touchpoint-info-divider"></div>

        <div
          className="touchpoint-info-item"
          ref={(el) => (cardsRef.current[1] = el)}
          style={{ opacity: 0 }}
        >
          <div className="touchpoint-info-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
          <div className="touchpoint-info-text">
            <span className="touchpoint-info-label">Call Us</span>
            <a href={`tel:${supportPhone.replace(/\s+/g, "")}`} className="touchpoint-info-value">{supportPhone}</a>
          </div>
        </div>

        <div className="touchpoint-info-divider"></div>

        <div
          className="touchpoint-info-item"
          ref={(el) => (cardsRef.current[2] = el)}
          style={{ opacity: 0 }}
        >
          <div className="touchpoint-info-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="touchpoint-info-text">
            <span className="touchpoint-info-label">Visit Us</span>
            <span className="touchpoint-info-value">{visitLocation}</span>
          </div>
        </div>

        <div className="touchpoint-info-divider"></div>

        <div
          className="touchpoint-info-item"
          ref={(el) => (cardsRef.current[3] = el)}
          style={{ opacity: 0 }}
        >
          <div className="touchpoint-info-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="touchpoint-info-text">
            <span className="touchpoint-info-label">Hours</span>
            <span className="touchpoint-info-value">{info.hours || "Mon to Sat, 10am–6pm"}</span>
          </div>
        </div>
      </section>

      {/* Form Section - Split layout */}
      <section className="touchpoint-form-section" ref={formRef}>
        <div className="touchpoint-form-split">
          <div className="touchpoint-form-left">
            <span className="touchpoint-form-eyebrow">{c.formEyebrow || "Get in Touch"}</span>
            <h2 className="touchpoint-form-heading">{lines(c.formHeading || "Send Us\nA Message")}</h2>
            <p className="touchpoint-form-copy">
              {c.formCopy || "Whether it's a question about our products, a partnership inquiry, or just to say hello, we'd love to hear from you."}
            </p>
            <div className="touchpoint-form-image">
              <img src={c.formImage?.url || "/images/why1.png"} alt="Cleanse Ayurveda" />
            </div>
          </div>
          <div className="touchpoint-form-right">
            {submitted ? (
              <div className="touchpoint-form touchpoint-sent">
                <span className="touchpoint-sent-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <h3 className="touchpoint-sent-title">Message Sent!</h3>
                <p className="touchpoint-sent-text">Thank you for reaching out. We&apos;ll get back to you soon.</p>
                <button className="touchpoint-submit-btn touchpoint-sent-btn" onClick={() => setSubmitted(false)}>
                  <span>Send Another</span>
                </button>
              </div>
            ) : (
              <form className="touchpoint-form" onSubmit={handleContactSubmit}>
                {/* Honeypot: hidden from people, irresistible to bots. Anything
                    typed here makes the server silently discard the submission. */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={formData.website}
                  onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />
                <div className="touchpoint-form-row">
                  <div className="touchpoint-input-group">
                    <label>First Name</label>
                    <input type="text" placeholder="First name" required value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="touchpoint-input-group">
                    <label>Last Name</label>
                    <input type="text" placeholder="Last name" value={formData.lastName} onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="touchpoint-input-group">
                  <label>Email</label>
                  <input type="email" placeholder="your@email.com" required value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="touchpoint-input-group">
                  <label>Subject</label>
                  <select value={formData.subject} onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}>
                    <option value="">Select a topic</option>
                    {subjectOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="touchpoint-input-group">
                  <label>Message</label>
                  <textarea rows="5" placeholder="Tell us how we can help..." required value={formData.message} onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))} />
                </div>
                <button type="submit" className="touchpoint-submit-btn" disabled={submitting}>
                  <span>{submitting ? "Sending..." : "Send Message"}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section - Accordion. id is the target of the footer's /touchpoint#faq link. */}
      <section className="touchpoint-faq" id="faq">
        <div className="touchpoint-faq-header">
          <span className="touchpoint-faq-eyebrow">{c.faqTag || "Support"}</span>
          <h2 className="touchpoint-faq-title">{lines(c.faqTitle || "Frequently Asked\nQuestions")}</h2>
        </div>
        <div className="touchpoint-faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`touchpoint-faq-item ${openFaq === index ? "active" : ""}`}
              ref={(el) => (faqRefs.current[index] = el)}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div className="touchpoint-faq-question">
                <h4>{faq.q}</h4>
                <div className="touchpoint-faq-toggle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" className="faq-v-line" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </div>
              <div className="touchpoint-faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

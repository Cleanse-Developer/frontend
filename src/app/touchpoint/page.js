"use client";
import "./touchpoint.css";
import { useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { contactApi } from "@/lib/endpoints";

const faqs = [
  { q: "What are your shipping times?", a: "We ship within 2-3 business days. Delivery takes 5-7 days across India and 10-14 days internationally." },
  { q: "Do you offer returns?", a: "Yes, we offer a 7-day return policy on unopened products. Contact our support team to initiate a return." },
  { q: "Are your products 100% natural?", a: "All Cleanse products are made with pure, ethically sourced Ayurvedic ingredients with no synthetic additives." },
  { q: "Do you ship internationally?", a: "Yes, we ship worldwide. International shipping charges are calculated at checkout based on your location." },
];

export default function Touchpoint() {
  const heroRef = useRef(null);
  const cardsRef = useRef([]);
  const formRef = useRef(null);
  const faqRefs = useRef([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({ name: "", lastName: "", email: "", subject: "", message: "" });
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
          <img src="/images/b2.png" alt="" />
        </div>
        <div className="touchpoint-hero-content">
          <div className="touchpoint-breadcrumb">
            <Link href="/">HOME</Link>/ <span>CONTACT</span>
          </div>
          <h1 className="touchpoint-hero-title">LET&apos;S<br />CONNECT</h1>
          <p className="touchpoint-hero-subtitle">
            We&apos;re here to guide your wellness journey with ancient wisdom and modern care.
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
            <a href="mailto:hello@cleanseayurveda.com" className="touchpoint-info-value">hello@cleanseayurveda.com</a>
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
            <a href="tel:+919876543210" className="touchpoint-info-value">+91 98765 43210</a>
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
            <span className="touchpoint-info-value">Rishikesh, Uttarakhand</span>
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
            <span className="touchpoint-info-value">Mon — Sat, 10am–6pm</span>
          </div>
        </div>
      </section>

      {/* Form Section - Split layout */}
      <section className="touchpoint-form-section" ref={formRef}>
        <div className="touchpoint-form-split">
          <div className="touchpoint-form-left">
            <span className="touchpoint-form-eyebrow">Get in Touch</span>
            <h2 className="touchpoint-form-heading">Send Us<br />A Message</h2>
            <p className="touchpoint-form-copy">
              Whether it&apos;s a question about our products, a partnership inquiry, or just to say hello — we&apos;d love to hear from you.
            </p>
            <div className="touchpoint-form-image">
              <img src="/images/why1.png" alt="Cleanse Ayurveda" />
            </div>
          </div>
          <div className="touchpoint-form-right">
            {submitted ? (
              <div className="touchpoint-form" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", minHeight: "300px" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4F2C22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <h3 style={{ color: "#4F2C22", fontSize: "1.4rem" }}>Message Sent!</h3>
                <p style={{ color: "#6b5c4c", textAlign: "center" }}>Thank you for reaching out. We&apos;ll get back to you soon.</p>
                <button className="touchpoint-submit-btn" onClick={() => setSubmitted(false)} style={{ marginTop: "0.5rem" }}>
                  <span>Send Another</span>
                </button>
              </div>
            ) : (
              <form className="touchpoint-form" onSubmit={handleContactSubmit}>
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
                    <option value="Order Inquiry">Order Inquiry</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Returns & Exchanges">Returns & Exchanges</option>
                    <option value="Wholesale & Partnerships">Wholesale & Partnerships</option>
                    <option value="Other">Other</option>
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

      {/* FAQ Section - Accordion */}
      <section className="touchpoint-faq">
        <div className="touchpoint-faq-header">
          <span className="touchpoint-faq-eyebrow">Support</span>
          <h2 className="touchpoint-faq-title">Frequently Asked<br />Questions</h2>
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

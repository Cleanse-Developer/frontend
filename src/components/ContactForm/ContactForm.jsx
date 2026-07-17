"use client";
import "./ContactForm.css";
import { useState, useEffect } from "react";
import { MdOutlineArrowOutward } from "react-icons/md";
import { newsletterApi } from "@/lib/endpoints";
import { useSettings } from "@/context/SettingsContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactForm = () => {
  const settings = useSettings();
  // Same number the newsletter popup offers — read from the one CMS field so the
  // two surfaces can never advertise different discounts.
  const discountPercent = settings.newsletterPopupConfig?.discountPercent || 10;

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset state on every fresh mount so the success message doesn't persist
  // across navigation if the user comes back to the same page.
  useEffect(() => {
    setSubmitted(false);
    setEmail("");
    setError("");
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await newsletterApi.subscribe(trimmed, "footer");
      setSubmitted(true);
      setEmail("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to subscribe. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="contact-form">
      <div className="contact-parallax-image-wrapper">
        <img src="/images/hero.png" alt="Cleanse Ayurveda Products" />
      </div>
      <div className="contact-form-container">
        <div className="cf-header">
          <h4>Join Our Wellness Journey</h4>
        </div>
        <div className="cf-copy">
          <p className="bodyCopy sm">
            Subscribe and get {discountPercent}% off your first order, plus
            exclusive rituals, new arrivals, and ancient beauty secrets.
          </p>
        </div>
        {!submitted ? (
          <>
            <div className="cf-row">
              <div className="cf-input">
                <input
                  type="email"
                  required
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  aria-invalid={!!error}
                />
              </div>
              <button
                type="button"
                className="cf-submit"
                onClick={handleSubmit}
                disabled={submitting}
                aria-label="Subscribe"
                style={{ cursor: submitting ? "wait" : "pointer", border: "none" }}
              >
                {submitting ? "..." : <MdOutlineArrowOutward />}
              </button>
            </div>
            {error && (
              <div className="cf-input">
                <p className="bodyCopy sm" style={{ color: "#c62828" }}>
                  {error}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="cf-input">
            <p className="bodyCopy sm" style={{ color: "#4CAF50" }}>Thank you for subscribing!</p>
          </div>
        )}
        <div className="cf-footer">
          <div className="cf-divider"></div>
          <div className="cf-footer-copy">
            <p className="bodyCopy sm">
              No spam, Just pure
              Ayurvedic wisdom
              delivered to your inbox
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

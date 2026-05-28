"use client";
import "./NewsletterPopup.css";
import { useState, useEffect } from "react";
import { newsletterApi } from "@/lib/endpoints";
import { useSettings } from "@/context/SettingsContext";

function safeSetItem(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage full or unavailable
  }
}

const NewsletterPopup = ({ isOpen, onClose }) => {
  const settings = useSettings();
  const popupConfig = settings.newsletterPopupConfig || {};

  const tag = popupConfig.tag || "JOIN OUR COMMUNITY";
  const heading = popupConfig.heading || "Get 10% Off";
  const description =
    popupConfig.description ||
    "Subscribe to our newsletter and receive exclusive offers, Ayurvedic tips, and new product updates.";
  const note = popupConfig.note || "No spam, unsubscribe anytime.";
  const image = popupConfig.image || "/p1.png";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  // Reset state when popup opens (so reopening after success shows the form)
  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setErrorMsg("");
      // Don't clear email — user may want to retry the same address
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === "submitting") return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      await newsletterApi.subscribe(email, "popup");
      setStatus("success");
      safeSetItem(sessionStorage, "newsletterPopupSubscribed", "true");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Something went wrong. Please try again.";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="newsletter-overlay">
      <div className="newsletter-modal">
        <button className="newsletter-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="newsletter-content">
          <div className="newsletter-image">
            <img src={image} alt="Ayurvedic Products" />
          </div>

          <div className="newsletter-form-section">
            {status === "success" ? (
              <div className="newsletter-success">
                <div className="success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2>You&apos;re subscribed!</h2>
                <p>Thanks for joining. Watch your inbox for our next update.</p>
              </div>
            ) : (
              <>
                <span className="newsletter-tag">{tag}</span>
                <h2>{heading}</h2>
                <p>{description}</p>

                <form onSubmit={handleSubmit} className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {status === "error" && errorMsg && (
                    <p className="newsletter-error">{errorMsg}</p>
                  )}
                  <button
                    type="submit"
                    className="newsletter-submit"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? "Subscribing..." : "Subscribe"}
                  </button>
                </form>

                <p className="newsletter-note">{note}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;

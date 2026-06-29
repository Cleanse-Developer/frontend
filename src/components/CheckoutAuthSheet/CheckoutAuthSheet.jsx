"use client";
import "./CheckoutAuthSheet.css";
import { useEffect } from "react";

/**
 * Bottom sheet shown when a non-logged-in user starts checkout.
 * Offers Login (→ login page) or Continue as Guest (→ checkout flow).
 *
 * Controlled component: parent owns `open` + the action handlers.
 */
export default function CheckoutAuthSheet({ open, onClose, onLogin, onGuest }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`cas-overlay ${open ? "open" : ""}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        className="cas-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Continue to checkout"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="cas-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h2 className="cas-title">Contact Information</h2>
        <p className="cas-sub">Log in for faster checkout, or continue as a guest.</p>
        <div className="cas-actions">
          <button type="button" className="cas-btn cas-btn-outline" onClick={onLogin}>
            Login
          </button>
          <button type="button" className="cas-btn cas-btn-filled" onClick={onGuest}>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

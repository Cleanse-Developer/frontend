"use client";
import { useEffect } from "react";

export default function CouponModal({ open, type = "error", title, message, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="coupon-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="coupon-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className={`coupon-modal-icon coupon-modal-icon--${type}`}>
          {type === "success" ? (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
          )}
        </div>

        <h3 className="coupon-modal-title">{title}</h3>
        {message && <p className="coupon-modal-message">{message}</p>}

        <button className="coupon-modal-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}

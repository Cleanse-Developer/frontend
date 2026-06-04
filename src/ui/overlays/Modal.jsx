"use client";
import { useEffect } from "react";
import "./Modal.css";

/**
 * Modal — centered dialog over a blurred backdrop, modelled on the
 * NewsletterPopup modal. Closes on Esc / backdrop click. Controlled via `open`.
 */
export default function Modal({ open, onClose, children, className = "", labelledBy, closeOnBackdrop = true }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="ui-modal-overlay"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div className={`ui-modal ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ui-modal-close" onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}

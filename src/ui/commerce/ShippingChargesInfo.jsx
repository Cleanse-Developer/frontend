"use client";
import "./ShippingChargesInfo.css";
import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { toNum } from "@/lib/formatters";

/**
 * "i" icon next to a Shipping line that reveals the per-payment-method delivery
 * charges (prepaid vs COD). Single source of truth — used identically on the cart
 * page, checkout summary and mini-cart.
 *
 * The bubble is rendered in a PORTAL on <body> with fixed positioning, so it can
 * never inherit a host container's colour/opacity/overflow (e.g. the mini-cart's
 * `.cart-summary-row span` rule) — it looks the same everywhere.
 *
 * Feeds off the /shipping/config breakdown: { prepaid:{standardRate,freeAbove}, cod:{…}, zone }.
 */

// ₹ with Indian grouping; drops the ".00" on whole-rupee amounts.
const rupee = (n) => {
  const v = toNum(n);
  if (v == null) return null;
  const s = Number.isInteger(v) ? v.toLocaleString("en-IN") : v.toFixed(2);
  return `₹${s}`;
};

const BUBBLE_WIDTH = 240;

export default function ShippingChargesInfo({ breakdown }) {
  const [pos, setPos] = useState(null); // { top, left } when open, null when closed
  const iconRef = useRef(null);

  const open = useCallback(() => {
    const el = iconRef.current;
    if (!el || typeof window === "undefined") return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    // Anchor below the icon, left-aligned, clamped to the viewport.
    let left = r.left;
    if (left + BUBBLE_WIDTH + 8 > vw) left = vw - BUBBLE_WIDTH - 8;
    if (left < 8) left = 8;
    setPos({ top: r.bottom + 8, left });
  }, []);

  const close = useCallback(() => setPos(null), []);

  const prepaid = breakdown?.prepaid;
  const cod = breakdown?.cod;
  const pRate = rupee(prepaid?.standardRate);
  const cRate = rupee(cod?.standardRate);
  if (!pRate && !cRate) return null;

  const pFree = toNum(prepaid?.freeAbove) || 0;
  const cFree = toNum(cod?.freeAbove) || 0;
  // Shared threshold → show once as a footer note instead of per row.
  const sharedFree = pRate && cRate && pFree > 0 && pFree === cFree;

  const rows = [];
  if (pRate) rows.push({ label: "Prepaid", rate: pRate, free: sharedFree ? 0 : pFree });
  if (cRate) rows.push({ label: "COD", rate: cRate, free: sharedFree ? 0 : cFree });

  const bubble =
    pos && typeof document !== "undefined"
      ? createPortal(
          <div
            className="shipping-info-bubble"
            style={{ top: pos.top, left: pos.left }}
            role="tooltip"
          >
            <span className="shipping-info-title">Delivery charges</span>
            {rows.map((r) => (
              <span key={r.label} className="shipping-info-row">
                <span className="shipping-info-method">{r.label}</span>
                <span className="shipping-info-rate">{r.rate}</span>
                {r.free ? (
                  <span className="shipping-info-free">Free above {rupee(r.free)}</span>
                ) : null}
              </span>
            ))}
            {sharedFree ? (
              <span className="shipping-info-note">Free delivery above {rupee(pFree)}</span>
            ) : null}
            {breakdown?.zone ? (
              <span className="shipping-info-zone">Zone: {breakdown.zone}</span>
            ) : null}
          </div>,
          document.body
        )
      : null;

  return (
    <span
      ref={iconRef}
      className="shipping-info-icon"
      role="img"
      tabIndex={0}
      aria-label="Delivery charge details for prepaid and Cash on Delivery"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      {bubble}
    </span>
  );
}

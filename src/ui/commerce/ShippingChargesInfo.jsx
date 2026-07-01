"use client";
import "./ShippingChargesInfo.css";
import { Tooltip } from "@/ui/overlays";
import { toNum } from "@/lib/formatters";

/**
 * Small "i" icon that reveals the per-payment-method delivery charges
 * (prepaid vs COD) on hover/focus. Feeds off the /shipping/config breakdown
 * response: { prepaid: {standardRate, freeAbove}, cod: {…}, zone }.
 *
 * Renders nothing until a breakdown with at least one method rate is available.
 */
// ₹ with Indian grouping; drops the ".00" on whole-rupee amounts.
const rupee = (n) => {
  const v = toNum(n);
  if (v == null) return null;
  const s = Number.isInteger(v) ? v.toLocaleString("en-IN") : v.toFixed(2);
  return `₹${s}`;
};

export default function ShippingChargesInfo({ breakdown, position = "top" }) {
  const prepaid = breakdown?.prepaid;
  const cod = breakdown?.cod;

  const pRate = rupee(prepaid?.standardRate);
  const cRate = rupee(cod?.standardRate);
  if (!pRate && !cRate) return null;

  const pFree = toNum(prepaid?.freeAbove) || 0;
  const cFree = toNum(cod?.freeAbove) || 0;
  // When both methods share the same free-shipping threshold, show it once as a
  // footer note instead of repeating it per row.
  const sharedFree = pRate && cRate && pFree > 0 && pFree === cFree;

  const rows = [];
  if (pRate) rows.push({ label: "Prepaid", rate: pRate, free: sharedFree ? 0 : pFree });
  if (cRate) rows.push({ label: "COD", rate: cRate, free: sharedFree ? 0 : cFree });

  const label = (
    <span className="shipping-info-tip-content">
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
    </span>
  );

  return (
    <Tooltip label={label} position={position} className="shipping-info-tip">
      <span
        className="shipping-info-icon"
        role="img"
        aria-label="Delivery charge details for prepaid and Cash on Delivery"
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
      </span>
    </Tooltip>
  );
}

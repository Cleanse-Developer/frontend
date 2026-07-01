"use client";
import "./ShippingChargesInfo.css";
import { Tooltip } from "@/ui/overlays";
import { toNum, formatPrice } from "@/lib/formatters";

/**
 * Small "i" icon that reveals the per-payment-method delivery charges
 * (prepaid vs COD) on hover/focus. Feeds off the /shipping/config breakdown
 * response: { prepaid: {standardRate, freeAbove}, cod: {…}, zone }.
 *
 * Renders nothing until a breakdown with at least one method is available.
 */
function methodLine(label, cfg) {
  const rate = toNum(cfg?.standardRate);
  if (rate == null) return null;
  const free = toNum(cfg?.freeAbove);
  const rateText = rate === 0 ? "Free" : `₹${formatPrice(rate)}`;
  return (
    <span className="shipping-info-row">
      <span className="shipping-info-method">{label}</span>
      <span className="shipping-info-value">
        {rateText}
        {free ? <em> · free above &#8377;{formatPrice(free)}</em> : null}
      </span>
    </span>
  );
}

export default function ShippingChargesInfo({ breakdown, position = "top" }) {
  const prepaid = breakdown?.prepaid;
  const cod = breakdown?.cod;
  const prepaidLine = methodLine("Prepaid", prepaid);
  const codLine = methodLine("COD", cod);
  if (!prepaidLine && !codLine) return null;

  const label = (
    <span className="shipping-info-tip-content">
      <span className="shipping-info-title">Delivery charges</span>
      {prepaidLine}
      {codLine}
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

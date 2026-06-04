"use client";
import { useState } from "react";
import Button from "../primitives/Button";
import "./CouponInput.css";

/**
 * CouponInput — coupon code field + apply button, modelled on the cart pricing
 * coupon entry. Calls `onApply(code)`; shows `error`/`applied` feedback.
 */
export default function CouponInput({ onApply, applied, error, loading = false, className = "" }) {
  const [code, setCode] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const c = code.trim();
    if (c) onApply?.(c);
  };
  return (
    <form className={`ui-coupon ${className}`.trim()} onSubmit={submit}>
      <div className="ui-coupon-row">
        <input
          className="ui-coupon-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          aria-label="Coupon code"
        />
        <Button type="submit" variant="rect" disabled={loading}>
          {loading ? "Applying…" : "Apply"}
        </Button>
      </div>
      {error ? <p className="ui-coupon-msg ui-coupon-msg--error">{error}</p> : null}
      {applied ? <p className="ui-coupon-msg ui-coupon-msg--ok">Applied: {applied}</p> : null}
    </form>
  );
}

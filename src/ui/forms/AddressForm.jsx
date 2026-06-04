"use client";
import { useState } from "react";
import Input from "../primitives/Input";
import Button from "../primitives/Button";
import "./AddressForm.css";

const EMPTY = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

/**
 * AddressForm — shipping/billing address fields, modelled on the checkout form.
 * Controlled or uncontrolled; calls `onSubmit(address)`.
 */
export default function AddressForm({ initial = {}, onSubmit, submitLabel = "Save address", className = "" }) {
  const [values, setValues] = useState({ ...EMPTY, ...initial });
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    onSubmit?.(values);
  };

  return (
    <form className={`ui-address-form ${className}`.trim()} onSubmit={submit}>
      <div className="ui-address-grid">
        <Input className="ui-address-col-2" placeholder="Full name" value={values.fullName} onChange={set("fullName")} />
        <Input placeholder="Phone" value={values.phone} onChange={set("phone")} inputMode="tel" />
        <Input placeholder="Pincode" value={values.pincode} onChange={set("pincode")} inputMode="numeric" />
        <Input className="ui-address-col-2" placeholder="Address line 1" value={values.line1} onChange={set("line1")} />
        <Input className="ui-address-col-2" placeholder="Address line 2 (optional)" value={values.line2} onChange={set("line2")} />
        <Input placeholder="City" value={values.city} onChange={set("city")} />
        <Input placeholder="State" value={values.state} onChange={set("state")} />
      </div>
      <Button type="submit" variant="primary" className="ui-address-submit">{submitLabel}</Button>
    </form>
  );
}

// Checkout form validation utilities

import { validatePostal, validatePhoneForCountry, DEFAULT_COUNTRY } from "./countries";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value, { optional = false } = {}) {
  if (!value || !value.trim()) return optional ? null : "Email address is required";
  if (!EMAIL_REGEX.test(value.trim())) return "Please enter a valid email address";
  return null;
}

export function validatePhone(value, country = DEFAULT_COUNTRY) {
  if (!value || !value.trim()) return "Phone number is required";
  return validatePhoneForCountry(value, country);
}

export function validateFullName(value, { optional = false } = {}) {
  if (!value || !value.trim()) return optional ? null : "Full name is required";
  if (value.trim().length < 2) return "Name must be at least 2 characters";
  return null;
}

export function validateAddress1(value) {
  if (!value || !value.trim()) return "Address is required";
  if (value.trim().length < 5) return "Please enter a complete address";
  return null;
}

export function validateCity(value) {
  if (!value || !value.trim()) return "City is required";
  return null;
}

export function validateState(value) {
  if (!value || !value.trim()) return "Please select a state / region";
  return null;
}

export function validatePincode(value, country = DEFAULT_COUNTRY) {
  return validatePostal(value, country);
}

export function validateUpiId(value) {
  if (!value || !value.trim()) return "UPI ID is required";
  if (!value.includes("@")) return "Please enter a valid UPI ID (e.g. name@upi)";
  return null;
}

// Validate a single field by name. `opts` is forwarded to the contact validators
// (email/fullName → { optional }) and carries `country` for the country-aware
// phone/pincode rules.
export function validateField(fieldName, value, opts = {}) {
  const country = opts.country || DEFAULT_COUNTRY;
  const validators = {
    email: validateEmail,
    phone: (v) => validatePhone(v, country),
    fullName: validateFullName,
    address1: validateAddress1,
    city: validateCity,
    state: validateState,
    pincode: (v) => validatePincode(v, country),
    upiId: validateUpiId,
  };
  const fn = validators[fieldName];
  if (!fn) return null;
  if (fieldName === "email" || fieldName === "fullName") return fn(value, opts);
  return fn(value);
}

// Validate the entire shipping form. When requireContact is false (guest
// checkout), email + full name become optional (but are still format-checked
// when provided); phone stays required. Phone/pincode formats follow
// shipping.country.
export function validateShippingForm(shipping, { requireContact = true } = {}) {
  const errors = {};
  const fields = ["email", "phone", "fullName", "address1", "city", "state", "pincode"];
  const country = shipping.country || DEFAULT_COUNTRY;

  for (const field of fields) {
    const optional = !requireContact && (field === "email" || field === "fullName");
    const error = validateField(field, shipping[field], { optional, country });
    if (error) errors[field] = error;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

// Validate the billing form (same fields minus email/phone)
export function validateBillingForm(billing) {
  const errors = {};
  const fields = ["fullName", "address1", "city", "state", "pincode"];
  const country = billing.country || DEFAULT_COUNTRY;

  for (const field of fields) {
    const error = validateField(field, billing[field], { country });
    if (error) {
      errors[`billing_${field}`] = error;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

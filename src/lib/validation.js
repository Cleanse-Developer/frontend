// Checkout form validation utilities

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^\d{6}$/;

export function validateEmail(value) {
  if (!value || !value.trim()) return "Email address is required";
  if (!EMAIL_REGEX.test(value.trim())) return "Please enter a valid email address";
  return null;
}

export function validatePhone(value) {
  if (!value || !value.trim()) return "Phone number is required";
  const digits = value.replace(/[\s\-]/g, "");
  if (!PHONE_REGEX.test(digits)) return "Please enter a valid 10-digit phone number";
  return null;
}

export function validateFullName(value) {
  if (!value || !value.trim()) return "Full name is required";
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
  if (!value || !value.trim()) return "Please select a state";
  return null;
}

export function validatePincode(value) {
  if (!value || !value.trim()) return "Pincode is required";
  if (!PINCODE_REGEX.test(value.trim())) return "Please enter a valid 6-digit pincode";
  return null;
}

export function validateUpiId(value) {
  if (!value || !value.trim()) return "UPI ID is required";
  if (!value.includes("@")) return "Please enter a valid UPI ID (e.g. name@upi)";
  return null;
}

// Validate a single field by name
export function validateField(fieldName, value) {
  const validators = {
    email: validateEmail,
    phone: validatePhone,
    fullName: validateFullName,
    address1: validateAddress1,
    city: validateCity,
    state: validateState,
    pincode: validatePincode,
    upiId: validateUpiId,
  };
  const fn = validators[fieldName];
  return fn ? fn(value) : null;
}

// Validate the entire shipping form
export function validateShippingForm(shipping) {
  const errors = {};
  const fields = ["email", "phone", "fullName", "address1", "city", "state", "pincode"];

  for (const field of fields) {
    const error = validateField(field, shipping[field]);
    if (error) errors[field] = error;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

// Validate the billing form (same fields minus email/phone)
export function validateBillingForm(billing) {
  const errors = {};
  const fields = ["fullName", "address1", "city", "state", "pincode"];

  for (const field of fields) {
    const error = validateField(field, billing[field]);
    if (error) {
      errors[`billing_${field}`] = error;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

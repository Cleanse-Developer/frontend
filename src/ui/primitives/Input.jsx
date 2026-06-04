import "./Input.css";

/**
 * Input — text field with the brand's body font and rounded border, consistent
 * with the contact/newsletter/checkout form fields.
 */
export default function Input({ className = "", invalid = false, ...props }) {
  const cls = `ui-input ${invalid ? "ui-input--invalid" : ""} ${className}`.trim();
  return <input className={cls} {...props} />;
}

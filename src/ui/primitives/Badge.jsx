import "./Badge.css";

/**
 * Badge — small uppercase chip (eyebrows, status pills, the EN·₹ locale style).
 * tone: "solid" (filled) | "outline" | "soft" (default soft).
 */
export default function Badge({ tone = "soft", className = "", children, ...props }) {
  const cls = `ui-badge ui-badge--${tone} ${className}`.trim();
  return (
    <span className={cls} {...props}>
      {children}
    </span>
  );
}

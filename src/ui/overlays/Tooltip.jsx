"use client";
import "./Tooltip.css";

/**
 * Tooltip — CSS hover/focus tooltip. Wraps its children; shows `label` on hover.
 * `position`: "top" (default) | "bottom" | "left" | "right".
 */
export default function Tooltip({ label, position = "top", children, className = "" }) {
  return (
    <span className={`ui-tooltip ui-tooltip--${position} ${className}`.trim()} tabIndex={0}>
      {children}
      <span className="ui-tooltip-bubble" role="tooltip">{label}</span>
    </span>
  );
}

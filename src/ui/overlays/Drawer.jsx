"use client";
import { useEffect } from "react";
import "./Drawer.css";

/**
 * Drawer — slide-in panel over a backdrop, the generic form of the shopping
 * cart drawer. `side`: "right" (default) | "left". Controlled via `open`.
 */
export default function Drawer({
  open,
  onClose,
  side = "right",
  width = "min(420px, 92vw)",
  children,
  className = "",
  labelledBy,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div className={`ui-drawer-root ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="ui-drawer-backdrop" onClick={onClose} />
      <aside
        className={`ui-drawer ui-drawer--${side} ${className}`.trim()}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <button type="button" className="ui-drawer-close" onClick={onClose} aria-label="Close">×</button>
        {children}
      </aside>
    </div>
  );
}

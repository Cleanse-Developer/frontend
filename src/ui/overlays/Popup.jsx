"use client";
import { useEffect, useState } from "react";
import { usePopupManager } from "@/context/PopupContext";
import "./Popup.css";

/**
 * Popup — corner promo popup (FOMO / newsletter style) that coordinates with
 * the global single-popup manager (context/PopupContext) so only one shows at
 * a time. Controlled via `open`; `id` must be unique. `position`: corner.
 */
export default function Popup({
  id,
  open,
  onClose,
  position = "bottom-right",
  children,
  className = "",
}) {
  const manager = usePopupManager?.();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const allowed = manager?.requestOpen ? manager.requestOpen(id) : true;
      if (allowed) setVisible(true);
    } else {
      setVisible(false);
      manager?.release?.(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id]);

  useEffect(() => () => manager?.release?.(id), [id, manager]);

  if (!visible) return null;
  const close = () => {
    setVisible(false);
    manager?.release?.(id);
    onClose?.();
  };

  return (
    <div className={`ui-popup ui-popup--${position} ${className}`.trim()} role="dialog" aria-label="Notice">
      <button type="button" className="ui-popup-close" onClick={close} aria-label="Close">×</button>
      {children}
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { usePopupManager } from "@/context/PopupContext";
import NewsletterPopup from "./NewsletterPopup";

const POPUP_ID = "newsletter";
const EXCLUDED_PATHS = ["/checkout", "/login", "/register"];
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_DELAY_S = 8;

function safeGetItem(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage full or unavailable
  }
}

export default function NewsletterPopupWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSettings();
  const pathname = usePathname();
  const { requestOpen, release, onRelease } = usePopupManager();

  useEffect(() => {
    if (!settings.newsletterPopupEnabled) return;

    // Don't show on excluded pages
    if (EXCLUDED_PATHS.some((p) => pathname?.startsWith(p))) return;

    // Check dismiss cooldown
    const dismissedAt = safeGetItem(localStorage, "newsletterPopupDismissed");
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (!isNaN(elapsed) && elapsed < DISMISS_COOLDOWN_MS) return;
    }

    // Check if already subscribed this session
    if (safeGetItem(sessionStorage, "newsletterPopupSubscribed")) return;

    const delayS = settings.newsletterPopupConfig?.delaySeconds || DEFAULT_DELAY_S;
    const delayMs = Math.max(1, Math.min(120, delayS)) * 1000;

    const tryOpen = () => {
      if (requestOpen(POPUP_ID)) {
        setIsOpen(true);
        return true;
      }
      return false;
    };

    const timer = setTimeout(() => {
      if (!tryOpen()) {
        // Another popup is showing, wait for it to close
        const unsubscribe = onRelease(() => {
          const retryTimer = setTimeout(() => {
            tryOpen();
            unsubscribe();
          }, 1000);
          return () => clearTimeout(retryTimer);
        });
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [settings.newsletterPopupEnabled, settings.newsletterPopupConfig, pathname, requestOpen, onRelease]);

  const handleClose = useCallback(() => {
    safeSetItem(localStorage, "newsletterPopupDismissed", String(Date.now()));
    setIsOpen(false);
    release(POPUP_ID);
  }, [release]);

  if (!settings.newsletterPopupEnabled) return null;

  return <NewsletterPopup isOpen={isOpen} onClose={handleClose} />;
}

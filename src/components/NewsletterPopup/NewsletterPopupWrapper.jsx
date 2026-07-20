"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { usePopupManager } from "@/context/PopupContext";
import NewsletterPopup from "./NewsletterPopup";

const POPUP_ID = "newsletter";
const SPIN_WHEEL_ID = "spin-wheel";
const EXCLUDED_PATHS = ["/checkout", "/login", "/register"];
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_DELAY_S = 8;
// The wheel leads; the newsletter (10% off) opens this long after the wheel opens.
const OPEN_AFTER_SPIN_MS = 60 * 1000; // 1 minute after the wheel opens
// Safety net: if the wheel is eligible but never actually opens, still show the
// newsletter eventually instead of waiting on an event that won't fire.
const SPIN_LEAD_FALLBACK_MS = 90 * 1000;

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

// Mirror of SpinWheelWrapper's gating: will the wheel popup lead? If so, the
// newsletter sequences one minute after it; if not, it shows on its own delay.
function spinWheelWillLead(settings, pathname) {
  if (!settings.spinWheelEnabled) return false;
  if (EXCLUDED_PATHS.some((p) => pathname?.startsWith(p))) return false;
  const dismissedAt = safeGetItem(localStorage, "spinWheelDismissed");
  if (dismissedAt) {
    const elapsed = Date.now() - Number(dismissedAt);
    if (!isNaN(elapsed) && elapsed < DISMISS_COOLDOWN_MS) return false;
  }
  const storedResult = safeGetItem(localStorage, "spinWheelResult");
  if (storedResult) {
    try {
      const parsed = JSON.parse(storedResult);
      if (parsed?.prize?.couponCode) return false;
    } catch {
      // corrupt cache — treat as no active result, wheel can still lead
    }
  }
  return true;
}

export default function NewsletterPopupWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSettings();
  const pathname = usePathname();
  const { requestOpen, release, onRelease, onOpen } = usePopupManager();

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
    const standaloneDelayMs = Math.max(1, Math.min(120, delayS)) * 1000;

    const tryOpen = () => {
      if (requestOpen(POPUP_ID)) {
        setIsOpen(true);
        return true;
      }
      return false;
    };

    let openTimer = null;
    let fallbackTimer = null;
    let unsubOpen = null;
    let unsubRelease = null;

    // Open now; if the wheel still holds the slot at this point, open the instant
    // it closes (the 1-minute gap has already elapsed by then).
    const openOrWait = () => {
      if (tryOpen()) return;
      unsubRelease = onRelease(() => {
        if (unsubRelease) {
          unsubRelease();
          unsubRelease = null;
        }
        tryOpen();
      });
    };

    if (spinWheelWillLead(settings, pathname)) {
      // Lead popup is the wheel — arm the newsletter for 1 minute after it opens.
      unsubOpen = onOpen((id) => {
        if (id !== SPIN_WHEEL_ID) return;
        if (unsubOpen) {
          unsubOpen();
          unsubOpen = null;
        }
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        openTimer = setTimeout(openOrWait, OPEN_AFTER_SPIN_MS);
      });
      // Safety net if the wheel never actually opens.
      fallbackTimer = setTimeout(() => {
        if (unsubOpen) {
          unsubOpen();
          unsubOpen = null;
        }
        openOrWait();
      }, SPIN_LEAD_FALLBACK_MS);
    } else {
      // No wheel to follow — open on the newsletter's own delay.
      openTimer = setTimeout(openOrWait, standaloneDelayMs);
    }

    return () => {
      if (openTimer) clearTimeout(openTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (unsubOpen) unsubOpen();
      if (unsubRelease) unsubRelease();
    };
  }, [
    settings.newsletterPopupEnabled,
    settings.newsletterPopupConfig,
    settings.spinWheelEnabled,
    pathname,
    requestOpen,
    onRelease,
    onOpen,
  ]);

  const handleClose = useCallback(() => {
    safeSetItem(localStorage, "newsletterPopupDismissed", String(Date.now()));
    setIsOpen(false);
    release(POPUP_ID);
  }, [release]);

  if (!settings.newsletterPopupEnabled) return null;

  return <NewsletterPopup isOpen={isOpen} onClose={handleClose} />;
}

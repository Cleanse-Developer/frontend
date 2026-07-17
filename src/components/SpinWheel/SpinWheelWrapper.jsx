"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { usePopupManager } from "@/context/PopupContext";
import SpinWheel from "./SpinWheel";

const POPUP_ID = "spin-wheel";
const EXCLUDED_PATHS = ["/checkout", "/login", "/register"];
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const POPUP_DELAY_MS = 5000; // 5 seconds
// Gap to leave after another popup closes before this one opens — symmetrical
// with NewsletterPopupWrapper, so the two can never appear back to back.
const AFTER_OTHER_POPUP_DELAY_MS = 60 * 1000;

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

function safeRemoveItem(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    // Storage unavailable
  }
}

export default function SpinWheelWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSettings();
  const pathname = usePathname();
  const { requestOpen, release, onRelease } = usePopupManager();

  useEffect(() => {
    if (!settings.spinWheelEnabled) return;

    // Don't show on excluded pages
    if (EXCLUDED_PATHS.some((p) => pathname?.startsWith(p))) return;

    // Check dismiss cooldown
    const dismissedAt = safeGetItem(localStorage, "spinWheelDismissed");
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (!isNaN(elapsed) && elapsed < DISMISS_COOLDOWN_MS) return;
    }

    // Check if user already has an active spin result cached
    const storedResult = safeGetItem(localStorage, "spinWheelResult");
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        if (parsed?.prize?.couponCode) return;
      } catch {
        safeRemoveItem(localStorage, "spinWheelResult");
        safeRemoveItem(localStorage, "spinWheelEmail");
      }
    }

    const tryOpen = () => {
      if (requestOpen(POPUP_ID)) {
        setIsOpen(true);
        return true;
      }
      return false;
    };

    let retryTimer = null;
    let unsubscribe = null;

    const timer = setTimeout(() => {
      if (!tryOpen()) {
        // Another popup is showing. Wait for it to close, then leave a full
        // minute rather than reopening straight away.
        unsubscribe = onRelease(() => {
          retryTimer = setTimeout(() => {
            tryOpen();
            if (unsubscribe) unsubscribe();
          }, AFTER_OTHER_POPUP_DELAY_MS);
        });
      }
    }, POPUP_DELAY_MS);

    return () => {
      clearTimeout(timer);
      if (retryTimer) clearTimeout(retryTimer);
      if (unsubscribe) unsubscribe();
    };
  }, [settings.spinWheelEnabled, pathname, requestOpen, onRelease]);

  const handleClose = useCallback(() => {
    safeSetItem(localStorage, "spinWheelDismissed", String(Date.now()));
    setIsOpen(false);
    release(POPUP_ID);
  }, [release]);

  const handleComplete = useCallback(() => {
    setIsOpen(false);
    release(POPUP_ID);
  }, [release]);

  if (!settings.spinWheelEnabled) return null;

  return (
    <SpinWheel
      isOpen={isOpen}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}

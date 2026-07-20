"use client";

import { useEffect } from "react";
import { captureFromUrl } from "@/lib/referral";

// Invisible: on first load, captures ?ref from a referral share link into
// localStorage so it survives navigation to whichever signup path the visitor
// ends up using, then strips it from the URL so it doesn't linger.
export default function ReferralCapture() {
  useEffect(() => {
    captureFromUrl();
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("ref")) {
        url.searchParams.delete("ref");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}

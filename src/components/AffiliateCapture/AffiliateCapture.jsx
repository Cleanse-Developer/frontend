"use client";

import { useEffect } from "react";
import { captureFromUrl } from "@/lib/affiliate";

// Invisible: on first load, captures ?aff/?coupon from a promoter link redirect
// into localStorage, then strips them from the URL so they don't linger.
export default function AffiliateCapture() {
  useEffect(() => {
    captureFromUrl();
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("aff") || url.searchParams.has("coupon")) {
        url.searchParams.delete("aff");
        url.searchParams.delete("coupon");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}

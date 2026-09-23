"use client";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { initTracking, setTrackingUser, trackPageView } from "@/lib/tracking";

// Loads GTM + Meta Pixel, keeps the signed-in user's matching data current, and
// fires a page view on every client-side route change.
function TrackingInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    initTracking();
  }, []);

  // Identify before the first page view, so the landing PageView already
  // carries the user's matching data. Waits for the auth restore to settle.
  useEffect(() => {
    if (isLoading) return;
    setTrackingUser(user);
  }, [user, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    const qs = searchParams?.toString();
    trackPageView(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams, isLoading]);

  return null;
}

export default function Tracking() {
  return (
    <Suspense fallback={null}>
      <TrackingInner />
    </Suspense>
  );
}

// No-JS fallbacks for both tags. Rendered server-side at the top of <body>.
export function TrackingNoScript({ gtmId, pixelId }) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        alt=""
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}

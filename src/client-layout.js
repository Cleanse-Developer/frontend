"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

import { ReactLenis } from "lenis/react";

export default function ClientLayout({ children, footer, header }) {
  const pageRef = useRef();
  const lenisRef = useRef(null);
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // On every route change, jump to the top (hero). Lenis owns the scroll
  // position via rAF, so a bare window.scrollTo gets reverted on the next
  // tick — drive Lenis's own scrollTo (immediate) so the new page starts at
  // the top. Falls back to window.scrollTo if Lenis isn't ready yet.
  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  const scrollSettings = isMobile
    ? {
        duration: 0.45,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 1,
        infinite: false,
        lerp: 0.12,
        wheelMultiplier: 1,
        orientation: "vertical",
        smoothWheel: false,
        syncTouch: false,
      }
    : {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        lerp: 0.1,
        wheelMultiplier: 1,
        orientation: "vertical",
        smoothWheel: true,
        syncTouch: true,
      };

  return (
    <ReactLenis root options={scrollSettings} ref={lenisRef}>
      <div className="page" ref={pageRef}>
        {pathname !== "/login" && header}
        {children}
        {pathname !== "/lookbook" && pathname !== "/login" && footer}
      </div>
    </ReactLenis>
  );
}

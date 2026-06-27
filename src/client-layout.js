"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

import { ReactLenis } from "lenis/react";
import { registerScrollTrigger, ScrollTrigger } from "@/ui/animations/scrollTrigger";

export default function ClientLayout({ children, footer, header }) {
  const pageRef = useRef();
  const lenisRef = useRef(null);
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);

  // Kill the mobile "jitter" caused by the browser's URL/tab bar showing and
  // hiding as you scroll: that fires a resize (height-only) which makes
  // ScrollTrigger recompute every pin/start and snap the layout. `ignoreMobileResize`
  // tells ScrollTrigger to ignore those toolbar-driven height changes. Set once,
  // globally — applies to every ScrollTrigger on every page. (We deliberately do
  // NOT use normalizeScroll, which would conflict with Lenis.)
  useEffect(() => {
    registerScrollTrigger();
    ScrollTrigger.config({ ignoreMobileResize: true });
  }, []);

  // Freeze a stable viewport height in CSS (--app-height). Full-height heroes
  // use this instead of 100svh/100vh so they DON'T resize when Chrome/Safari
  // mobile slide their top/bottom bars in and out on scroll (which only changes
  // the height and was making the hero — and the whole page — jump). We lock the
  // pixel height at load and only recompute it on a real WIDTH change (rotation
  // or desktop window resize), never on the toolbar's height-only resizes.
  useEffect(() => {
    const root = document.documentElement;
    const setAppHeight = () => {
      root.style.setProperty("--app-height", `${window.innerHeight}px`);
    };
    setAppHeight();
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        setAppHeight();
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", setAppHeight);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", setAppHeight);
    };
  }, []);

  // Cart buttons on product cards "open" (slide out the "Add to cart" label) on
  // tap. Touch :hover/:focus/:active are unreliable (flicker / open only while
  // held / icon shake), so we drive the open state with a stable class instead:
  // tapping a cart button adds `.cart-open` (and closes any other open one).
  useEffect(() => {
    const onClick = (e) => {
      const btn = e.target.closest?.(".product-card-cart-btn");
      document
        .querySelectorAll(".product-card-cart-btn.cart-open")
        .forEach((b) => {
          if (b !== btn) b.classList.remove("cart-open");
        });
      if (btn) btn.classList.add("cart-open");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      // Only treat WIDTH crossing the breakpoint as a real change; ignore the
      // height-only resizes from the mobile toolbar so we don't thrash state.
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

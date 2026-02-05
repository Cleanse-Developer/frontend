"use client";
import "./Menu.css";
import Link from "next/link";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

import { useCartCount } from "@/store/cartStore";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a8 8 0 0116 0v1" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6h12l1.5 12H4.5L6 6z" />
    <path d="M9 6V4a3 3 0 016 0v2" />
  </svg>
);

const Menu = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const cartCount = useCartCount();

  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(!isHomePage);
  const [isNavGreen, setIsNavGreen] = useState(!isHomePage);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  const menuRef = useRef(null);
  const menuOverlayRef = useRef(null);
  const hamburgerRef = useRef(null);
  const menuTriggerRef = useRef(null);
  const splitTextsRef = useRef([]);
  const mainLinkSplitsRef = useRef([]);
  const lastScrollY = useRef(0);

  const scrambleText = (elements, duration = 0.4) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

    elements.forEach((char) => {
      const originalText = char.textContent;
      let iterations = 0;
      const maxIterations = Math.floor(Math.random() * 6) + 3;

      gsap.set(char, { opacity: 1 });

      const scrambleInterval = setInterval(() => {
        char.textContent = chars[Math.floor(Math.random() * chars.length)];
        iterations++;

        if (iterations >= maxIterations) {
          clearInterval(scrambleInterval);
          char.textContent = originalText;
        }
      }, 25);

      setTimeout(() => {
        clearInterval(scrambleInterval);
        char.textContent = originalText;
      }, duration * 1000);
    });
  };

  const openMenu = () => {
    setIsOpen(true);
    setIsAnimating(true);

    if (hamburgerRef.current) {
      hamburgerRef.current.classList.add("open");
    }

    if (menuTriggerRef.current) {
      const dots = menuTriggerRef.current.querySelectorAll('.dot');
      gsap.to(dots[0], { x: 3, y: 3, duration: 0.4, ease: "power3.out" });
      gsap.to(dots[1], { x: -3, y: 3, duration: 0.4, ease: "power3.out" });
      gsap.to(dots[2], { x: 3, y: -3, duration: 0.4, ease: "power3.out" });
      gsap.to(dots[3], { x: -3, y: -3, duration: 0.4, ease: "power3.out" });
      gsap.to(menuTriggerRef.current, {
        rotation: 45,
        duration: 0.5,
        ease: "power3.out",
      });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
      },
    });

    tl.to(menuOverlayRef.current, {
      duration: 0.75,
      scaleY: 1,
      ease: "power4.out",
    });

    const allWords = mainLinkSplitsRef.current.reduce((acc, split) => {
      return acc.concat(split.words);
    }, []);

    tl.to(
      allWords,
      {
        duration: 0.75,
        yPercent: 0,
        stagger: 0.1,
        ease: "power4.out",
      },
      "-=0.5"
    );

    const subCols = menuOverlayRef.current.querySelectorAll(
      ".menu-overlay-sub-col"
    );
    subCols.forEach((col) => {
      const links = col.querySelectorAll(".menu-sub-links a");
      tl.to(
        links,
        {
          duration: 0.75,
          y: 0,
          opacity: 1,
          stagger: 0.05,
          ease: "power4.out",
        },
        "<"
      );
    });

    tl.add(() => {
      splitTextsRef.current.forEach((split) => {
        split.chars.forEach((char, index) => {
          setTimeout(() => {
            scrambleText([char], 0.4);
          }, index * 30);
        });
      });
    }, "<");
  };

  const closeMenu = () => {
    setIsAnimating(true);

    if (hamburgerRef.current) {
      hamburgerRef.current.classList.remove("open");
    }

    if (menuTriggerRef.current) {
      const dots = menuTriggerRef.current.querySelectorAll('.dot');
      gsap.to(dots, { x: 0, y: 0, duration: 0.4, ease: "power3.out" });
      gsap.to(menuTriggerRef.current, {
        rotation: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsOpen(false);
        setIsAnimating(false);
      },
    });

    tl.add(() => {
      const allChars = splitTextsRef.current.reduce((acc, split) => {
        return acc.concat(split.chars);
      }, []);
      gsap.to(allChars, { opacity: 0, duration: 0.2 });
    });

    const subCols = menuOverlayRef.current.querySelectorAll(
      ".menu-overlay-sub-col"
    );
    subCols.forEach((col) => {
      const links = col.querySelectorAll(".menu-sub-links a");
      tl.to(
        links,
        {
          duration: 0.3,
          y: 50,
          opacity: 0,
          stagger: -0.05,
          ease: "power3.in",
        },
        "<"
      );
    });

    const allWords = mainLinkSplitsRef.current.reduce((acc, split) => {
      return acc.concat(split.words);
    }, []);

    tl.to(
      allWords,
      {
        duration: 0.3,
        yPercent: 120,
        stagger: -0.05,
        ease: "power3.in",
      },
      "<"
    );

    tl.to(
      menuOverlayRef.current,
      {
        duration: 0.5,
        scaleY: 0,
        ease: "power3.inOut",
      },
      "-=0.1"
    );
  };

  const toggleMenu = () => {
    if (isAnimating) return;

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleLinkClick = () => {
    if (isOpen) {
      setTimeout(() => {
        closeMenu();
      }, 500);
    }
  };

  // Hide header during page transitions
  const transitionTimerRef = useRef(null);
  const pageTransitionActiveRef = useRef(false);

  useEffect(() => {
    const handlePageTransition = (e) => {
      if (!menuRef.current) return;

      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }

      if (e.detail.active) {
        pageTransitionActiveRef.current = true;
        setIsPageTransitioning(true);
        menuRef.current.classList.add("hidden");
        setIsMenuVisible(false);
      } else {
        // Delay the header reveal so it appears after the transition blocks clear
        transitionTimerRef.current = setTimeout(() => {
          if (menuRef.current) {
            // Reset scroll tracking so scroll handler doesn't see a phantom jump
            lastScrollY.current = window.scrollY;
            upScrollCountRef.current = 0;
            menuRef.current.classList.remove("hidden");
            setIsMenuVisible(true);
          }
          setIsPageTransitioning(false);
          pageTransitionActiveRef.current = false;
          transitionTimerRef.current = null;
        }, 600);
      }
    };

    window.addEventListener("page-transition", handlePageTransition);
    return () => {
      window.removeEventListener("page-transition", handlePageTransition);
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    gsap.set(menuOverlayRef.current, {
      scaleY: 0,
      transformOrigin: "top center",
    });

    const scrambleElements = menuOverlayRef.current.querySelectorAll(
      ".menu-items-header p, .menu-social a"
    );

    splitTextsRef.current = [];

    scrambleElements.forEach((element) => {
      const split = new SplitText(element, {
        type: "chars",
      });
      splitTextsRef.current.push(split);

      gsap.set(split.chars, {
        opacity: 0,
      });
    });

    const mainLinks =
      menuOverlayRef.current.querySelectorAll(".menu-main-link h4");
    mainLinkSplitsRef.current = [];

    mainLinks.forEach((element) => {
      const split = new SplitText(element, {
        type: "words",
        mask: "words",
      });
      mainLinkSplitsRef.current.push(split);

      gsap.set(split.words, {
        yPercent: 120,
      });
    });

    const subLinks =
      menuOverlayRef.current.querySelectorAll(".menu-sub-links a");
    gsap.set(subLinks, {
      y: 50,
      opacity: 0,
    });
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Sync scrolled state on route change
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
    } else {
      const heroHeight = window.innerHeight - 100;
      setIsScrolled(window.scrollY >= heroHeight);
    }
  }, [pathname, isHomePage]);

  const upScrollCountRef = useRef(0);
  const scrollInitializedRef = useRef(false);
  const transitioningRef = useRef(false);

  useEffect(() => {
    // Only initialize lastScrollY once on mount
    if (!scrollInitializedRef.current) {
      lastScrollY.current = window.scrollY;
      scrollInitializedRef.current = true;
    }

    const handleScroll = () => {
      // Block all scroll-based menu show/hide during page transitions
      if (pageTransitionActiveRef.current) {
        lastScrollY.current = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;
      const isMenuHidden = menuRef.current?.classList.contains("hidden");
      const heroHeight = window.innerHeight - 100; // Hero section threshold

      // Hero zone logic (home page only)
      if (isHomePage) {
        if (!isMobile && currentScrollY < heroHeight && !isMenuHidden && isScrolled && !transitioningRef.current) {
          // Desktop: smooth transition from green nav to transparent nav
          transitioningRef.current = true;
          menuRef.current?.classList.add("hidden");

          setTimeout(() => {
            setIsScrolled(false);
            setTimeout(() => {
              menuRef.current?.classList.remove("hidden");
              setIsMenuVisible(true);
              transitioningRef.current = false;
            }, 30);
          }, 50);
        } else if (isMobile && currentScrollY < 36 && isScrolled) {
          // Mobile: move menu back below promo banner when at top
          setIsScrolled(false);
        } else if (currentScrollY >= (isMobile ? 36 : heroHeight) && !isScrolled) {
          setIsScrolled(true);
        }

        // Green nav reveal at formulas section
        const formulasSection = document.querySelector('.formulas');
        const greenThreshold = formulasSection ? formulasSection.offsetTop : window.innerHeight;
        if (currentScrollY >= greenThreshold && !isNavGreen) {
          setIsNavGreen(true);
        } else if (currentScrollY < greenThreshold && isNavGreen) {
          setIsNavGreen(false);
        }
      }

      // On mobile, skip all hide/show logic - menu stays visible always
      if (isMobile) {
        lastScrollY.current = currentScrollY;
        return;
      }

      // Don't do hide/show logic during transition
      if (transitioningRef.current) {
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scrolling down or not moving - reset up scroll counter and hide if needed
      if (scrollDiff >= 0) {
        upScrollCountRef.current = 0; // Reset counter on any non-upward movement

        if (scrollDiff > 0 && currentScrollY > 10) {
          if (isOpen) {
            closeMenu();
          }
          if (menuRef.current && !menuRef.current.classList.contains("hidden")) {
            menuRef.current.classList.add("hidden");
            setIsMenuVisible(false);
          }
        }
      }
      // Scrolling up - accumulate up scroll distance
      else if (scrollDiff < -2) {
        // Accumulate upward scroll distance
        upScrollCountRef.current += Math.abs(scrollDiff);

        // On mobile in hero: only show menu when near the top
        // On desktop: show after 50px of continuous upward scroll
        const shouldShow = isMobile && !isScrolled
          ? currentScrollY < 80
          : upScrollCountRef.current > 50;

        if (shouldShow) {
          if (menuRef.current && menuRef.current.classList.contains("hidden")) {
            menuRef.current.classList.remove("hidden");
            setIsMenuVisible(true);
          }
        }
      }

      lastScrollY.current = currentScrollY;
    };

    // Ensure menu is visible on mobile
    if (isMobile && menuRef.current && menuRef.current.classList.contains("hidden")) {
      menuRef.current.classList.remove("hidden");
      setIsMenuVisible(true);
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, isMobile, isScrolled, isNavGreen, isHomePage]);

  // Re-apply hidden class after React re-renders during nav style transition
  // (scrolled green → transparent). Without this, React's re-render overwrites
  // the classList-added "hidden" class, causing a flash of the centered nav.
  useLayoutEffect(() => {
    if (transitioningRef.current && menuRef.current) {
      menuRef.current.classList.add('hidden');
    }
  }, [isScrolled]);

  return (
    <nav className={`menu ${isScrolled ? 'scrolled' : ''} ${isNavGreen ? 'nav-green' : ''} ${isOpen ? 'menu-open' : ''} ${isPageTransitioning ? 'page-transitioning' : ''}`} ref={menuRef}>
      <div className="menu-header">
        {/* Back arrow - shown on non-home pages when scrolled */}
        {!isHomePage && isScrolled && (
          <Link href="/" className="menu-back-arrow" aria-label="Back to home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
        )}

        {/* Full header content - shown in hero section */}
        <div className={`menu-header-full ${isScrolled ? 'hidden' : ''}`}>
          <Link href="/" className="menu-logo-link">
            <h4 className="menu-logo">Cleanse</h4>
          </Link>
          <div className="menu-nav-links">
            <Link href="/" className="menu-nav-link">Home</Link>
            <Link href="/wardrobe" className="menu-nav-link">Shop</Link>
            <Link href="/genesis" className="menu-nav-link">About</Link>
            <Link href="/touchpoint" className="menu-nav-link">Blog</Link>
          </div>
          <div className="menu-header-actions">
            <Link href="/profile" className="menu-action-btn" aria-label="Profile">
              <ProfileIcon />
            </Link>
            <Link href="/cart" className="menu-action-btn menu-cart-btn" aria-label="Cart">
              <CartIcon />
              {cartCount > 0 && <span className="menu-cart-badge">{cartCount}</span>}
            </Link>
            <button className="menu-trigger" onClick={toggleMenu} aria-label="Toggle menu">
              <div className="menu-trigger-icon" ref={menuTriggerRef}>
                <span className="dot dot-1"></span>
                <span className="dot dot-2"></span>
                <span className="dot dot-3"></span>
                <span className="dot dot-4"></span>
              </div>
            </button>
          </div>
          <div className="menu-mobile-actions">
            <Link href="/profile" className="menu-action-btn" aria-label="Profile">
              <ProfileIcon />
            </Link>
            <Link href="/cart" className="menu-action-btn menu-cart-btn" aria-label="Cart">
              <CartIcon />
              {cartCount > 0 && <span className="menu-cart-badge">{cartCount}</span>}
            </Link>
          </div>
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <div className="menu-hamburger-icon" ref={hamburgerRef}>
              <span className="menu-item"></span>
              <span className="menu-item"></span>
            </div>
          </button>
        </div>

        {/* Centered CLEANSE - shown when scrolled */}
        <div className={`menu-header-centered ${isScrolled ? 'visible' : ''}`}>
          <button
            className="menu-centered-logo"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <h4 className="menu-logo">Cleanse</h4>
          </button>
        </div>

        {/* Right-side actions - shown when scrolled */}
        <div className={`menu-scrolled-actions ${isScrolled ? 'visible' : ''}`}>
          <Link href="/profile" className="menu-action-btn" aria-label="Profile">
            <ProfileIcon />
          </Link>
          <Link href="/cart" className="menu-action-btn menu-cart-btn" aria-label="Cart">
            <CartIcon />
            {cartCount > 0 && <span className="menu-cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>

      <div className="menu-overlay" ref={menuOverlayRef}>
        <div className="menu-overlay-items">
          <div className="menu-overlay-col menu-overlay-col-sm">
            <div className="menu-items-header">
              <p>Navigate</p>
            </div>
            <div className="menu-main-links">
              <Link
                href="/"
                className="menu-main-link"
                onClick={handleLinkClick}
              >
                <h4>Home</h4>
              </Link>
              <Link
                href="/wardrobe"
                className="menu-main-link"
                onClick={handleLinkClick}
              >
                <h4>Shop</h4>
              </Link>
              <Link
                href="/genesis"
                className="menu-main-link"
                onClick={handleLinkClick}
              >
                <h4>Our Story</h4>
              </Link>
            </div>
          </div>
          <div className="menu-overlay-col menu-overlay-col-lg">
            <div className="menu-overlay-sub-col">
              <div className="menu-items-header">
                <p>Explore</p>
              </div>
              <div className="menu-sub-links">
                <Link href="/lookbook" onClick={handleLinkClick}>
                  Rituals
                </Link>
                <Link href="/touchpoint" onClick={handleLinkClick}>
                  Contact
                </Link>
                <Link href="/unit" onClick={handleLinkClick}>
                  Ingredients
                </Link>
              </div>
            </div>
            <div className="menu-overlay-sub-col">
              <div className="menu-items-header">
                <p>Bestsellers</p>
              </div>
              <div className="menu-sub-links menu-product-links">
                <Link href="/product" onClick={handleLinkClick}>
                  01. Golden Elixir Oil
                </Link>
                <Link href="/product" onClick={handleLinkClick}>
                  02. Turmeric Glow Mask
                </Link>
                <Link href="/product" onClick={handleLinkClick}>
                  03. Rose Hydra Mist
                </Link>
                <Link href="/product" onClick={handleLinkClick}>
                  04. Sandalwood Serum
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="menu-overlay-footer">
          <div className="menu-social">
            <a
              href="https://x.com/cleanseayurveda"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
            >
              Twitter
            </a>
          </div>
          <div className="menu-social">
            <a
              href="https://www.instagram.com/cleanseayurveda/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
            >
              Instagram
            </a>
          </div>
          <div className="menu-social">
            <a
              href="https://www.youtube.com/@cleanseayurveda"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Menu;

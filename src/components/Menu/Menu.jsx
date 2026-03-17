"use client";
import "./Menu.css";
import Link from "next/link";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
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
  const router = useRouter();
  const isHomePage = pathname === "/";
  const { cartCount } = useCart();
  const settings = useSettings();
  const cmsHeader = settings.cmsHeader || {};
  const navLinks = cmsHeader.navLinks || [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/wardrobe" },
    { label: "About", href: "/genesis" },
    { label: "Blog", href: "/blog" },
  ];
  const headerSocialLinks = cmsHeader.socialLinks || {
    twitter: "https://x.com/cleanseayurveda",
    instagram: "https://www.instagram.com/cleanseayurveda/",
    youtube: "https://www.youtube.com/@cleanseayurveda",
  };
  const logoSrc = cmsHeader.logoImage?.url || "/logo.png";

  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(!isHomePage);
  const [isNavGreen, setIsNavGreen] = useState(!isHomePage);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  const [lang, setLang] = useState("EN");
  const [currency, setCurrency] = useState("INR");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCurrMenu, setShowCurrMenu] = useState(false);

  const menuRef = useRef(null);
  const menuOverlayRef = useRef(null);
  const hamburgerRef = useRef(null);
  const menuTriggerRef = useRef(null);
  const splitTextsRef = useRef([]);
  const mainLinkSplitsRef = useRef([]);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const savedLang = localStorage.getItem("cleanse-lang");
    const savedCurrency = localStorage.getItem("cleanse-currency");
    if (savedLang) setLang(savedLang);
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  const handleLangChange = (l) => {
    setLang(l);
    localStorage.setItem("cleanse-lang", l);
    setShowLangMenu(false);
  };

  const handleCurrencyChange = (c) => {
    setCurrency(c);
    localStorage.setItem("cleanse-currency", c);
    setShowCurrMenu(false);
  };

  // Close selector dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-selector') && !e.target.closest('.menu-selectors')) {
        setShowLangMenu(false);
        setShowCurrMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const handleLinkClick = (e, href) => {
    if (isOpen) {
      e.preventDefault();
      // Close menu first, then navigate after animation completes
      closeMenu();
      setTimeout(() => {
        // Hide the entire menu before page transition
        setIsPageTransitioning(true);
        setIsMenuVisible(false);
        router.push(href);
      }, 600);
    }
  };

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    closeMenu();
    setTimeout(() => {
      if (isHomePage) {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        setIsPageTransitioning(true);
        setIsMenuVisible(false);
        router.push(`/#${sectionId}`);
      }
    }, 600);
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

  // Sync scrolled + navGreen state on route change
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      setIsNavGreen(true);
    } else {
      const heroHeight = window.innerHeight - 100;
      const scrolled = window.scrollY >= heroHeight;
      setIsScrolled(scrolled);
      if (!scrolled) {
        setIsNavGreen(false);
      }
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
        const formulasSection = document.querySelector('.formulas');
        const greenThreshold = formulasSection ? formulasSection.offsetTop : window.innerHeight;

        // Desktop: Scrolling back into hero zone from below
        if (!isMobile && currentScrollY < heroHeight && isScrolled && !transitioningRef.current) {
          // Smooth transition: slide nav up, change states, slide nav down
          transitioningRef.current = true;
          menuRef.current?.classList.add("hidden");

          setTimeout(() => {
            setIsNavGreen(false);
            setIsScrolled(false);
            setTimeout(() => {
              menuRef.current?.classList.remove("hidden");
              setIsMenuVisible(true);
              transitioningRef.current = false;
            }, 50);
          }, 300);
        }
        // Mobile: move menu back below promo banner when at top
        else if (isMobile && currentScrollY < 36 && isScrolled) {
          setIsScrolled(false);
          setIsNavGreen(false);
        }
        // Scrolling down past hero
        else if (currentScrollY >= (isMobile ? 36 : heroHeight) && !isScrolled) {
          setIsScrolled(true);
        }

        // Green nav reveal at formulas section (only when scrolled)
        if (isScrolled && !transitioningRef.current) {
          if (currentScrollY >= greenThreshold && !isNavGreen) {
            setIsNavGreen(true);
          } else if (currentScrollY < greenThreshold && isNavGreen) {
            setIsNavGreen(false);
          }
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

    window.addEventListener("scroll", handleScroll, { passive: true });

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
  }, [isScrolled, isNavGreen]);

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
            <img src={logoSrc} alt="Cleanse" className="menu-logo-img" />
          </Link>
          <div className="menu-nav-links">
            {navLinks.map((link, i) => (
              <Link key={i} href={link.href} className="menu-nav-link">{link.label}</Link>
            ))}
          </div>
          <div className="menu-header-actions">
            <div className="menu-selectors">
              <div className="menu-selector" onClick={() => { setShowLangMenu(!showLangMenu); setShowCurrMenu(false); }}>
                <span className="menu-selector-value">{lang}</span>
                {showLangMenu && (
                  <div className="menu-selector-dropdown">
                    {[{code: "EN", label: "English"}, {code: "HI", label: "Hindi"}, {code: "TA", label: "Tamil"}].map(l => (
                      <button key={l.code} className={`menu-selector-option ${lang === l.code ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); handleLangChange(l.code); }}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="menu-selector" onClick={() => { setShowCurrMenu(!showCurrMenu); setShowLangMenu(false); }}>
                <span className="menu-selector-value">{currency === "INR" ? "\u20B9" : currency === "USD" ? "$" : currency === "EUR" ? "\u20AC" : "\u00A3"}</span>
                {showCurrMenu && (
                  <div className="menu-selector-dropdown">
                    {[{code: "INR", label: "\u20B9 INR"}, {code: "USD", label: "$ USD"}, {code: "EUR", label: "\u20AC EUR"}, {code: "GBP", label: "\u00A3 GBP"}].map(c => (
                      <button key={c.code} className={`menu-selector-option ${currency === c.code ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); handleCurrencyChange(c.code); }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
        <div className="menu-header-centered">
          <button
            className="menu-centered-logo"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <img src={logoSrc} alt="Cleanse" className="menu-logo-img" />
          </button>
        </div>

        {/* Right-side actions - shown when scrolled */}
        <div className="menu-scrolled-actions">
          <div className="menu-selectors">
            <div className="menu-selector" onClick={() => { setShowLangMenu(!showLangMenu); setShowCurrMenu(false); }}>
              <span className="menu-selector-value">{lang}</span>
              {showLangMenu && (
                <div className="menu-selector-dropdown">
                  {[{code: "EN", label: "English"}, {code: "HI", label: "Hindi"}, {code: "TA", label: "Tamil"}].map(l => (
                    <button key={l.code} className={`menu-selector-option ${lang === l.code ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); handleLangChange(l.code); }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="menu-selector" onClick={() => { setShowCurrMenu(!showCurrMenu); setShowLangMenu(false); }}>
              <span className="menu-selector-value">{currency === "INR" ? "\u20B9" : currency === "USD" ? "$" : currency === "EUR" ? "\u20AC" : "\u00A3"}</span>
              {showCurrMenu && (
                <div className="menu-selector-dropdown">
                  {[{code: "INR", label: "\u20B9 INR"}, {code: "USD", label: "$ USD"}, {code: "EUR", label: "\u20AC EUR"}, {code: "GBP", label: "\u00A3 GBP"}].map(c => (
                    <button key={c.code} className={`menu-selector-option ${currency === c.code ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); handleCurrencyChange(c.code); }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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
                onClick={(e) => handleLinkClick(e, "/")}
              >
                <h4>Home</h4>
              </Link>
              <Link
                href="/wardrobe"
                className="menu-main-link"
                onClick={(e) => handleLinkClick(e, "/wardrobe")}
              >
                <h4>Shop</h4>
              </Link>
              <Link
                href="/genesis"
                className="menu-main-link"
                onClick={(e) => handleLinkClick(e, "/genesis")}
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
                <Link href="/lookbook" onClick={(e) => handleLinkClick(e, "/lookbook")}>
                  Lookbook
                </Link>
                <Link href="/touchpoint" onClick={(e) => handleLinkClick(e, "/touchpoint")}>
                  Contact
                </Link>
                <Link href="/unit" onClick={(e) => handleLinkClick(e, "/unit")}>
                  Ingredients
                </Link>
              </div>
            </div>
            <div className="menu-overlay-sub-col">
              <div className="menu-items-header">
                <p>Discover</p>
              </div>
              <div className="menu-sub-links menu-product-links">
                <a href="/#featured" onClick={(e) => handleSectionClick(e, "featured")}>
                  Featured
                </a>
                <a href="/#why-skin" onClick={(e) => handleSectionClick(e, "why-skin")}>
                  Why Cleanse
                </a>
                <a href="/#rituals" onClick={(e) => handleSectionClick(e, "rituals")}>
                  Rituals
                </a>
                <a href="/#testimonials" onClick={(e) => handleSectionClick(e, "testimonials")}>
                  Testimonials
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="menu-overlay-selectors">
          <div className="menu-overlay-selector-group">
            <span className="menu-overlay-selector-label">Language</span>
            <div className="menu-overlay-selector-pills">
              {["EN", "HI", "TA"].map(l => (
                <button key={l} className={`menu-overlay-pill ${lang === l ? "active" : ""}`} onClick={() => handleLangChange(l)}>{l}</button>
              ))}
            </div>
          </div>
          <div className="menu-overlay-selector-group">
            <span className="menu-overlay-selector-label">Currency</span>
            <div className="menu-overlay-selector-pills">
              {["INR", "USD", "EUR", "GBP"].map(c => (
                <button key={c} className={`menu-overlay-pill ${currency === c ? "active" : ""}`} onClick={() => handleCurrencyChange(c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="menu-overlay-footer">
          {Object.entries(headerSocialLinks).map(([platform, url]) => (
            <div key={platform} className="menu-social">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => isOpen && closeMenu()}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Menu;

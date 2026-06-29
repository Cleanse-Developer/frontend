"use client";
import "./Menu.css";
import Link from "next/link";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import Logo from "@/components/Logo/Logo";
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
    <path d="M6 9h12l1.5 12H4.5L6 9z" />
    <path d="M9 9V7a3 3 0 016 0v2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const CaretIcon = () => (
  <svg className="menu-locale-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* Single capsule combining language + currency. Only EN and Rupees are
   offered, shown inside the dropdown. */
const LocaleCapsule = ({ open, toggle, close }) => (
  <div className="menu-locale">
    <button
      type="button"
      className={`menu-locale-pill ${open ? "open" : ""}`}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label="Language and currency"
      onClick={toggle}
    >
      <span className="menu-locale-current">EN</span>
      <span className="menu-locale-divider" aria-hidden="true">·</span>
      <span className="menu-locale-current">{"₹"}</span>
      <CaretIcon />
    </button>
    {open && (
      <div className="menu-locale-dropdown" role="listbox">
        <div className="menu-locale-group">
          <button type="button" className="menu-locale-option active" onClick={(e) => { e.stopPropagation(); close(); }}>
            <span className="menu-locale-option-code">EN</span>
            <span className="menu-locale-option-name">English</span>
          </button>
        </div>
        <span className="menu-locale-group-sep" aria-hidden="true" />
        <div className="menu-locale-group">
          <button type="button" className="menu-locale-option active" onClick={(e) => { e.stopPropagation(); close(); }}>
            <span className="menu-locale-option-code">{"₹"}</span>
            <span className="menu-locale-option-name">Rupees</span>
          </button>
        </div>
      </div>
    )}
  </div>
);

const Menu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  // Product detail pages have a light hero — use a transparent header with dark text/icons
  const isUnitPage = pathname?.startsWith("/unit");
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
  // Product detail pages keep a solid brown header; every other page uses the
  // home behaviour (transparent over the hero, brown once scrolled past it).
  const [isScrolled, setIsScrolled] = useState(!isHomePage);
  const [isNavGreen, setIsNavGreen] = useState(!isHomePage);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  const [lang, setLang] = useState("EN");
  const [currency, setCurrency] = useState("INR");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCurrMenu, setShowCurrMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  const openSearch = () => {
    setShowLangMenu(false);
    setShowCurrMenu(false);
    setShowSearch(true);
  };

  const submitSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowSearch(false);
    setSearchQuery("");
    router.push(`/wardrobe?search=${encodeURIComponent(q)}`);
  };

  // Focus the input when the search bar opens; Esc closes it.
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!showSearch) return;
    const onKey = (e) => { if (e.key === "Escape") setShowSearch(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSearch]);

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
      if (!e.target.closest('.menu-locale')) {
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
    if (isUnitPage) {
      // Product detail: behave like home — transparent over the (light) hero,
      // solid brown once scrolled past it. Scrolled + green move together so the
      // brown bar always carries light content.
      const heroHeight = window.innerHeight - 100;
      const scrolled = window.scrollY >= heroHeight;
      setIsScrolled(scrolled);
      setIsNavGreen(scrolled);
    } else if (!isHomePage) {
      // Other non-home pages: always solid brown.
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
  }, [pathname, isHomePage, isUnitPage]);

  // Force the overlay fully CLOSED whenever the route changes. The close
  // animation's GSAP onComplete (which sets isOpen=false) can be interrupted by
  // the navigation/page transition, leaving the menu stuck open over the new
  // page. Resetting here guarantees it's closed, and re-arms the GSAP state so
  // the next open still animates from scratch.
  useEffect(() => {
    if (!menuOverlayRef.current) return;
    setIsOpen(false);
    setIsAnimating(false);

    gsap.killTweensOf(menuOverlayRef.current);
    gsap.set(menuOverlayRef.current, { scaleY: 0, transformOrigin: "top center" });

    const subLinks = menuOverlayRef.current.querySelectorAll(".menu-sub-links a");
    gsap.set(subLinks, { y: 50, opacity: 0 });
    mainLinkSplitsRef.current.forEach((s) => gsap.set(s.words, { yPercent: 120 }));
    splitTextsRef.current.forEach((s) => gsap.set(s.chars, { opacity: 0 }));

    if (hamburgerRef.current) hamburgerRef.current.classList.remove("open");
    if (menuTriggerRef.current) {
      gsap.set(menuTriggerRef.current.querySelectorAll(".dot"), { x: 0, y: 0 });
      gsap.set(menuTriggerRef.current, { rotation: 0 });
    }
  }, [pathname]);

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

      // Hero zone logic (transparent at top, brown on scroll). Product detail
      // pages opt out — they stay solid brown.
      if (isHomePage) {
        const formulasSection = document.querySelector('.formulas');
        // On mobile, turn the header brown right after the page's hero ends
        // (heroes are often shorter than a full viewport), so it isn't stuck
        // transparent over post-hero content.
        const heroEl = document.querySelector('.hero, .product-hero, .wardrobe-hero, .blog-hero, .blogpost-hero, .cart-hero, .checkout-hero, .genesis-hero, .lookbook-hero, .legal-hero, .profile-hero, .ritual-hero, .touchpoint-hero');
        const greenThreshold = formulasSection
          ? formulasSection.offsetTop
          : (isMobile && heroEl)
            ? heroEl.offsetTop + heroEl.offsetHeight - 64
            : window.innerHeight;

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

      // Product detail: transparent over the light hero, brown (scrolled + green)
      // past it. Scrolled and green toggle together so the brown bar always has
      // light content; on the hero the transparent header uses dark content.
      if (isUnitPage) {
        const threshold = isMobile ? 36 : heroHeight;
        if (currentScrollY >= threshold && !isScrolled) {
          setIsScrolled(true);
          setIsNavGreen(true);
        } else if (currentScrollY < threshold && isScrolled) {
          setIsScrolled(false);
          setIsNavGreen(false);
        }
      }

      // On mobile: hide the header when scrolling down, reveal it on scroll up.
      if (isMobile) {
        if (scrollDiff > 4 && currentScrollY > 80) {
          if (isOpen) closeMenu();
          if (menuRef.current && !menuRef.current.classList.contains("hidden")) {
            menuRef.current.classList.add("hidden");
            setIsMenuVisible(false);
          }
        } else if (scrollDiff < -4 || currentScrollY <= 80) {
          if (menuRef.current && menuRef.current.classList.contains("hidden")) {
            menuRef.current.classList.remove("hidden");
            setIsMenuVisible(true);
          }
        }
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
  }, [isOpen, isMobile, isScrolled, isNavGreen, isHomePage, isUnitPage]);

  // Re-apply hidden class after React re-renders during nav style transition
  // (scrolled green → transparent). Without this, React's re-render overwrites
  // the classList-added "hidden" class, causing a flash of the centered nav.
  useLayoutEffect(() => {
    if (transitioningRef.current && menuRef.current) {
      menuRef.current.classList.add('hidden');
    }
  }, [isScrolled, isNavGreen]);

  return (
    <nav className={`menu ${isScrolled ? 'scrolled' : ''} ${isNavGreen ? 'nav-green' : ''} ${isOpen ? 'menu-open' : ''} ${isPageTransitioning ? 'page-transitioning' : ''} ${isHomePage ? 'menu-has-banner' : ''} ${isUnitPage ? 'menu-unit' : ''}`} ref={menuRef}>
      <div className="menu-header">
        {/* Single hero header used in all states; gains a brown bg on scroll */}
        <div className="menu-header-full">
          <Link href="/" className="menu-logo-link">
            <Logo src={logoSrc} className="menu-logo-mark" imgClassName="menu-logo-img" />
          </Link>
          <div className="menu-nav-links">
            {navLinks.map((link, i) => (
              <Link key={i} href={link.href} className="menu-nav-link">{link.label}</Link>
            ))}
          </div>
          <div className="menu-header-actions">
            <LocaleCapsule open={showLangMenu} toggle={() => { setShowLangMenu(!showLangMenu); setShowCurrMenu(false); }} close={() => setShowLangMenu(false)} />
            <button type="button" className="menu-action-btn" aria-label="Search" onClick={openSearch}>
              <SearchIcon />
            </button>
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

        {/* Search bar overlay — opens from either header state */}
        {showSearch && (
          <div className="menu-search-overlay">
            <div className="menu-search-box">
              <SearchIcon />
              <input
                ref={searchInputRef}
                type="text"
                className="menu-search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
              />
              <button type="button" className="menu-search-close" aria-label="Close search" onClick={() => setShowSearch(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
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
                <Link href="/ritual" onClick={(e) => handleLinkClick(e, "/ritual")}>
                  The Ritual
                </Link>
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
            {/* Discover column — desktop only (hidden on mobile via CSS). */}
            <div className="menu-overlay-sub-col menu-discover-col">
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
        <p className="menu-overlay-footer-title">Socials</p>
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

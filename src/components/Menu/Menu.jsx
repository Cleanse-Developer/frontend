"use client";
import "./Menu.css";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;
      const isMenuHidden = menuRef.current?.classList.contains("hidden");
      const heroHeight = window.innerHeight - 100; // Hero section threshold

      // Smooth transition from green nav to transparent nav
      if (currentScrollY < heroHeight && !isMenuHidden && isScrolled && !transitioningRef.current) {
        // Entering hero zone while scrolling up - slide green nav up first
        transitioningRef.current = true;
        menuRef.current?.classList.add("hidden");

        // After green nav slides out, switch to transparent and slide back in
        setTimeout(() => {
          setIsScrolled(false);
          setTimeout(() => {
            menuRef.current?.classList.remove("hidden");
            setIsMenuVisible(true);
            transitioningRef.current = false;
          }, 50);
        }, 400);
      } else if (currentScrollY >= heroHeight && !isScrolled) {
        setIsScrolled(true);
      }

      // Skip hide/show on mobile
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

        if (scrollDiff > 2 && currentScrollY > 10) {
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

        // Only show header after scrolling up at least 50px continuously
        if (upScrollCountRef.current > 50) {
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
  }, [isOpen, isMobile, isScrolled]);

  return (
    <nav className={`menu ${isScrolled ? 'scrolled' : ''} ${isOpen ? 'menu-open' : ''}`} ref={menuRef}>
      <div className="menu-header">
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
            <button className="menu-trigger" onClick={toggleMenu} aria-label="Toggle menu">
              <div className="menu-trigger-icon" ref={menuTriggerRef}>
                <span className="dot dot-1"></span>
                <span className="dot dot-2"></span>
                <span className="dot dot-3"></span>
                <span className="dot dot-4"></span>
              </div>
            </button>
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

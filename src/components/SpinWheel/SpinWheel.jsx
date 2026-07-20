"use client";
import "./SpinWheel.css";
import { useState, useRef, useEffect, useCallback } from "react";
import { spinWheelApi } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";

const FALLBACK_PRIZES = [
  { label: "10% OFF", value: "10off", color: "#4F2C22", textColor: "#F0EDE8" },
  { label: "FREE SHIP", value: "freeship", color: "#F0EDE8", textColor: "#4F2C22" },
  { label: "5% OFF", value: "5off", color: "#4F2C22", textColor: "#F0EDE8" },
  { label: "TRY AGAIN", value: "tryagain", color: "#F0EDE8", textColor: "#4F2C22" },
  { label: "15% OFF", value: "15off", color: "#4F2C22", textColor: "#F0EDE8" },
  { label: "FREE GIFT", value: "sample", color: "#F0EDE8", textColor: "#4F2C22" },
];

const SPIN_DURATION_MS = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable
  }
}

function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable
  }
}

const SpinWheel = ({ isOpen, onClose, onComplete }) => {
  const { user, isAuthenticated } = useAuth();
  const [prizes, setPrizes] = useState(FALLBACK_PRIZES);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState("");
  const [hasSpun, setHasSpun] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const wheelRef = useRef(null);
  const apiResultRef = useRef(null);
  const spinTokenRef = useRef(null);
  const initRef = useRef(false);
  const mountedRef = useRef(true);
  const spinTimerRef = useRef(null);

  // Track mount state for safe async updates
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    };
  }, []);

  // Fetch prizes and check existing spin when popup opens
  useEffect(() => {
    if (!isOpen || initRef.current) return;
    initRef.current = true;

    const init = async () => {
      if (!mountedRef.current) return;
      setLoading(true);
      try {
        const prizeData = await spinWheelApi.getPrizes();
        if (mountedRef.current && prizeData?.prizes?.length) {
          setPrizes(prizeData.prizes);
        }
      } catch {
        // Keep fallback prizes
      }

      // Determine email
      const userEmail = isAuthenticated && user?.email ? user.email : "";
      if (mountedRef.current && userEmail) setEmail(userEmail);

      // Check for existing spin
      const checkEmail = userEmail || safeGetItem("spinWheelEmail");
      if (checkEmail) {
        try {
          const checkData = await spinWheelApi.check(checkEmail);
          if (mountedRef.current && checkData?.hasSpun) {
            setEmail(checkEmail);
            setResult(checkData.prize);
            setHasSpun(true);
            setLoading(false);
            return;
          }
        } catch {
          // Check failed, proceed to show spin form
        }
      }

      // Also check localStorage as a fallback
      const stored = safeGetItem("spinWheelResult");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.prize && parsed?.email) {
            if (!checkEmail || checkEmail !== parsed.email) {
              try {
                const verify = await spinWheelApi.check(parsed.email);
                if (mountedRef.current && verify?.hasSpun) {
                  setEmail(parsed.email);
                  setResult(verify.prize);
                  setHasSpun(true);
                  setLoading(false);
                  return;
                }
              } catch {
                // Stale localStorage, ignore
              }
            }
          }
        } catch {
          safeRemoveItem("spinWheelResult");
          safeRemoveItem("spinWheelEmail");
        }
      }

      if (mountedRef.current) setLoading(false);
    };

    init();
  }, [isOpen, isAuthenticated, user]);

  // Reset init when popup closes
  useEffect(() => {
    if (!isOpen) {
      initRef.current = false;
    }
  }, [isOpen]);

  const spinWheel = useCallback(async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    setError("");

    try {
      // Anonymous spin — no email needed. Server picks the prize and returns a
      // signed token we present at claim time.
      const data = await spinWheelApi.spin();

      if (!mountedRef.current) return;

      // Logged-in user who already has an active reward: show it (already claimed).
      if (data.alreadySpun) {
        setResult(data.prize);
        setHasSpun(true);
        setIsSpinning(false);
        return;
      }

      apiResultRef.current = data.prize;
      spinTokenRef.current = data.spinToken;
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err.response?.data?.message || "Something went wrong. Try again later.";
      setError(msg);
      setIsSpinning(false);
      return;
    }

    // Find the winning segment index to land on the correct prize
    const winValue = apiResultRef.current.value;
    const winIndex = prizes.findIndex((p) => p.value === winValue);
    const segmentSize = 360 / prizes.length;
    const targetAngle = 360 - (winIndex * segmentSize + segmentSize / 2);
    const spinDegrees = 1440 + targetAngle;
    const newRotation = rotation + spinDegrees;
    setRotation(newRotation);

    // Use transitionend event for sync, with setTimeout as fallback
    const handleTransitionEnd = () => {
      if (!mountedRef.current) return;
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
        spinTimerRef.current = null;
      }
      finishSpin();
    };

    const finishSpin = () => {
      if (!mountedRef.current) return;
      const prize = apiResultRef.current;
      // No couponCode yet — the reward becomes real only after the user claims
      // it with an email. Nothing is cached until then.
      setResult({
        label: prize.label,
        value: prize.value,
        isReward: prize.isReward,
      });
      setIsSpinning(false);
      setHasSpun(true);
    };

    // Listen for CSS transition end on the wheel
    const wheelEl = wheelRef.current;
    if (wheelEl) {
      wheelEl.addEventListener("transitionend", handleTransitionEnd, { once: true });
    }

    // Fallback timeout slightly longer than CSS duration, in case transitionend doesn't fire
    spinTimerRef.current = setTimeout(() => {
      if (wheelEl) wheelEl.removeEventListener("transitionend", handleTransitionEnd);
      finishSpin();
    }, SPIN_DURATION_MS + 200);
  }, [isSpinning, prizes, rotation]);

  // Claim the spun reward: bind it to the entered email, which is when the
  // coupon is actually created server-side.
  const handleClaim = useCallback(async () => {
    if (isClaiming) return;
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setIsClaiming(true);
    setError("");
    try {
      const data = await spinWheelApi.claim(email, spinTokenRef.current);
      if (!mountedRef.current) return;
      setResult(data.prize);
      safeSetItem("spinWheelEmail", email);
      safeSetItem("spinWheelResult", JSON.stringify({ email, prize: data.prize }));
      if (onComplete) onComplete(data.prize);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.response?.data?.message || "Could not claim your reward. Please try again.");
    } finally {
      if (mountedRef.current) setIsClaiming(false);
    }
  }, [email, isClaiming, onComplete]);

  if (!isOpen) return null;

  const emailLocked = isAuthenticated && !!user?.email;

  if (prizes.length === 0) return null;

  const segmentAngle = 360 / prizes.length;
  const radius = 132; // leaves room for the rim
  const centerX = 150;
  const centerY = 150;
  const RIM_R = 138;

  const createSegmentPath = (index) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (index) => {
    const mid = (index * segmentAngle) + (segmentAngle / 2);
    const angle = (mid - 90) * (Math.PI / 180);
    const textRadius = radius * 0.66;
    return {
      x: centerX + textRadius * Math.cos(angle),
      y: centerY + textRadius * Math.sin(angle),
      // Past the halfway point the label would hang upside down, so flip it back.
      rotation: mid > 90 && mid < 270 ? mid + 180 : mid,
    };
  };

  // Divider spokes sit on the boundary between two segments.
  const spokeEnd = (index) => {
    const a = (index * segmentAngle - 90) * (Math.PI / 180);
    return { x: centerX + radius * Math.cos(a), y: centerY + radius * Math.sin(a) };
  };

  // The CMS sets a textColor per prize, but the values disagree with each other
  // (one is gold, the rest cream/brown) which is a large part of why the wheel
  // read as messy. Derive it from the segment fill instead so contrast is always
  // right, whatever colours the CMS returns.
  const isDark = (hex) => {
    const h = String(hex || "").replace("#", "");
    if (h.length !== 6) return true;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  };

  // Bulbs around the rim, like a real prize wheel.
  const BULBS = Array.from({ length: prizes.length * 3 }, (_, i) => {
    const a = ((i * 360) / (prizes.length * 3) - 90) * (Math.PI / 180);
    return { x: centerX + RIM_R * Math.cos(a), y: centerY + RIM_R * Math.sin(a), i };
  });

  const winIdx = result && !isSpinning ? prizes.findIndex((p) => p.value === result.value) : -1;

  return (
    <div className="spin-wheel-overlay">
      <div className="spin-wheel-modal">
        <button className="spin-wheel-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="spin-wheel-content">
          <div className="spin-wheel-left">
            <img className="spin-wheel-promo-img" src="/popups/range-wide.webp" alt="Cleanse Ayurveda range" />
            <span className="spin-wheel-tag">EXCLUSIVE OFFER</span>
            <h2>Spin & Win</h2>
            <p>Try your luck and win exclusive discounts on our Ayurvedic collection</p>

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "rgba(79, 44, 34, 0.5)", fontSize: "0.9rem" }}>
                Loading...
              </div>
            ) : !hasSpun ? (
              <div className="spin-wheel-form">
                <p style={{ fontSize: "0.85rem", color: "rgba(79, 44, 34, 0.6)", margin: "0 0 0.5rem" }}>
                  No email needed to spin — enter it after to claim your reward.
                </p>
                {error && <p style={{ color: "#c0392b", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{error}</p>}
                <button
                  className="spin-btn"
                  onClick={spinWheel}
                  disabled={isSpinning}
                >
                  {isSpinning ? "Spinning..." : "Spin Now"}
                </button>
              </div>
            ) : result?.isReward && !result?.couponCode ? (
              // Reward won but not yet claimed — collect the email now.
              <div className="spin-result">
                <div className="result-badge">
                  <span className="result-label">You Won!</span>
                  <span className="result-prize">{result?.label}</span>
                </div>
                {emailLocked ? (
                  <p style={{ fontSize: "0.85rem", color: "rgba(79, 44, 34, 0.6)", margin: "0.25rem 0" }}>
                    Claiming as <strong>{user.email}</strong>
                  </p>
                ) : (
                  <input
                    className="claim-input"
                    type="email"
                    placeholder="Enter your email to claim"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                )}
                {error && <p style={{ color: "#c0392b", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{error}</p>}
                <button
                  className="claim-btn"
                  onClick={handleClaim}
                  disabled={isClaiming || (!emailLocked && !email)}
                >
                  {isClaiming ? "Claiming..." : "Claim Reward"}
                </button>
              </div>
            ) : (
              // Final view: claimed reward (with code) or a "try again" result.
              <div className="spin-result">
                <div className="result-badge">
                  <span className="result-label">{result?.value === "tryagain" ? "Oops!" : "You Won!"}</span>
                  <span className="result-prize">{result?.label}</span>
                </div>
                {result?.couponCode ? (
                  <p className="result-code">Use code: <strong>{result.couponCode}</strong></p>
                ) : (
                  <p className="result-code">Better luck next time!</p>
                )}
                <button className="claim-btn" onClick={onClose}>
                  {result?.couponCode ? "Done" : "Close"}
                </button>
              </div>
            )}
          </div>

          <div className="spin-wheel-right">
            <div className="wheel-container">
              <div className={`wheel-pointer${isSpinning ? " is-ticking" : ""}`}>
                <svg width="30" height="40" viewBox="0 0 30 40">
                  <defs>
                    <linearGradient id="ptrGold" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F3E2B6" />
                      <stop offset="50%" stopColor="#C8AD73" />
                      <stop offset="100%" stopColor="#8A6A2F" />
                    </linearGradient>
                  </defs>
                  <path d="M15 40 L3 12 A 12 12 0 1 1 27 12 Z" fill="url(#ptrGold)"
                    stroke="#4F2C22" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx="15" cy="12" r="4.5" fill="#4F2C22" />
                </svg>
              </div>
              <div
                className="wheel"
                ref={wheelRef}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : "none",
                }}
              >
                <svg viewBox="0 0 300 300" className="wheel-svg">
                  <defs>
                    {/* Gold rim: the light/dark stops read as a bevel catching light. */}
                    <linearGradient id="rimGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F0DCA8" />
                      <stop offset="35%" stopColor="#C8AD73" />
                      <stop offset="65%" stopColor="#8A6A2F" />
                      <stop offset="100%" stopColor="#E3C88C" />
                    </linearGradient>
                    <radialGradient id="hubGold" cx="35%" cy="30%">
                      <stop offset="0%" stopColor="#F3E2B6" />
                      <stop offset="60%" stopColor="#C8AD73" />
                      <stop offset="100%" stopColor="#8A6A2F" />
                    </radialGradient>
                    {/* One sheen over the whole face — cheaper and more even than a
                        gradient per segment, and it works with any CMS colour. */}
                    <radialGradient id="faceSheen" cx="34%" cy="26%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.30" />
                      <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
                    </radialGradient>
                    <filter id="rimShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2E1F14" floodOpacity="0.35" />
                    </filter>
                  </defs>

                  {/* Rim */}
                  <circle cx={centerX} cy={centerY} r={RIM_R} fill="none"
                    stroke="url(#rimGold)" strokeWidth="11" filter="url(#rimShadow)" />

                  {prizes.map((prize, index) => {
                    const pos = getTextPosition(index);
                    const ink = isDark(prize.color) ? "#F5EFE2" : "#4F2C22";
                    return (
                      <g key={prize.value}>
                        <path d={createSegmentPath(index)} fill={prize.color} />
                        <text
                          x={pos.x}
                          y={pos.y}
                          fill={ink}
                          fontSize="12.5"
                          fontWeight="600"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${pos.rotation}, ${pos.x}, ${pos.y})`}
                          style={{ textTransform: "uppercase", letterSpacing: "1.2px" }}
                        >
                          {prize.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gold spokes on the segment boundaries */}
                  {prizes.map((prize, index) => {
                    const e = spokeEnd(index);
                    return (
                      <line key={`spoke-${prize.value}`} x1={centerX} y1={centerY} x2={e.x} y2={e.y}
                        stroke="#C8AD73" strokeWidth="1.25" strokeOpacity="0.75" />
                    );
                  })}

                  {/* Lighting pass, over the segments but under the rim furniture. */}
                  <circle cx={centerX} cy={centerY} r={radius} fill="url(#faceSheen)" pointerEvents="none" />

                  {/* Winning wedge, outlined once the wheel stops. */}
                  {winIdx >= 0 && result?.value !== "tryagain" && (
                    <path className="seg-win" d={createSegmentPath(winIdx)} fill="none"
                      stroke="#F0DCA8" strokeWidth="3" strokeLinejoin="round" />
                  )}

                  {BULBS.map((b) => (
                    <circle key={`bulb-${b.i}`} cx={b.x} cy={b.y} r="2.6"
                      fill={b.i % 2 ? "#4F2C22" : "#FBEFCE"} fillOpacity={b.i % 2 ? 0.55 : 0.95} />
                  ))}

                  <circle cx={centerX} cy={centerY} r="34" fill="url(#hubGold)" filter="url(#rimShadow)" />
                  <circle cx={centerX} cy={centerY} r="27" fill="#4F2C22" />
                </svg>
                <div className="wheel-center-logo">
                  <img src="/cleanse-monogram.svg" alt="Cleanse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;

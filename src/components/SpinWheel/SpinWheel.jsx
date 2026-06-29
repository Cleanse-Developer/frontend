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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const wheelRef = useRef(null);
  const apiResultRef = useRef(null);
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
    if (isSpinning || (!email && !isAuthenticated)) return;

    setIsSpinning(true);
    setResult(null);
    setError("");

    try {
      const data = await spinWheelApi.spin(email);

      if (!mountedRef.current) return;

      // If already spun, show existing result
      if (data.alreadySpun) {
        setResult(data.prize);
        setHasSpun(true);
        setIsSpinning(false);
        return;
      }

      apiResultRef.current = data.prize;
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
      const resultData = {
        label: prize.label,
        value: prize.value,
        couponCode: prize.couponCode,
      };
      setResult(resultData);
      setIsSpinning(false);
      setHasSpun(true);

      safeSetItem("spinWheelEmail", email);
      safeSetItem("spinWheelResult", JSON.stringify({ email, prize: resultData }));
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
  }, [isSpinning, email, isAuthenticated, prizes, rotation]);

  const handleClaim = () => {
    if (onComplete) onComplete(result);
    onClose();
  };

  if (!isOpen) return null;

  const emailLocked = isAuthenticated && !!user?.email;

  if (prizes.length === 0) return null;

  const segmentAngle = 360 / prizes.length;
  const radius = 140;
  const centerX = 150;
  const centerY = 150;

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
    const angle = ((index * segmentAngle) + (segmentAngle / 2) - 90) * (Math.PI / 180);
    const textRadius = radius * 0.65;
    return {
      x: centerX + textRadius * Math.cos(angle),
      y: centerY + textRadius * Math.sin(angle),
      rotation: (index * segmentAngle) + (segmentAngle / 2),
    };
  };

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
                {emailLocked ? (
                  <p style={{ fontSize: "0.85rem", color: "rgba(79, 44, 34, 0.6)", margin: "0 0 0.5rem" }}>
                    Spinning as <strong>{user.email}</strong>
                  </p>
                ) : (
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                )}
                {error && <p style={{ color: "#c0392b", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{error}</p>}
                <button
                  className="spin-btn"
                  onClick={spinWheel}
                  disabled={isSpinning || !email}
                >
                  {isSpinning ? "Spinning..." : "Spin Now"}
                </button>
              </div>
            ) : (
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
                <button className="claim-btn" onClick={handleClaim}>
                  {result?.couponCode ? "Claim Reward" : "Close"}
                </button>
              </div>
            )}
          </div>

          <div className="spin-wheel-right">
            <div className="wheel-container">
              <div className="wheel-pointer">
                <svg width="24" height="32" viewBox="0 0 24 32" fill="#663532">
                  <polygon points="12,32 0,0 24,0" />
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
                  {prizes.map((prize, index) => (
                    <g key={prize.value}>
                      <path
                        d={createSegmentPath(index)}
                        fill={prize.color}
                        stroke="#663532"
                        strokeWidth="1"
                      />
                      <text
                        x={getTextPosition(index).x}
                        y={getTextPosition(index).y}
                        fill={prize.textColor}
                        fontSize="12"
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${getTextPosition(index).rotation}, ${getTextPosition(index).x}, ${getTextPosition(index).y})`}
                        style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
                      >
                        {prize.label}
                      </text>
                    </g>
                  ))}
                  <circle cx={centerX} cy={centerY} r="35" fill="#4F2C22" stroke="#663532" strokeWidth="3" />
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

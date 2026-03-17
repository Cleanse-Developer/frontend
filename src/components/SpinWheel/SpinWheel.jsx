"use client";
import "./SpinWheel.css";
import { useState, useRef } from "react";
import { spinWheelApi } from "@/lib/endpoints";

const prizes = [
  { label: "10% OFF", value: "10off", color: "#4F2C22", textColor: "#F0EDE8" },
  { label: "FREE SHIP", value: "freeship", color: "#F0EDE8", textColor: "#4F2C22" },
  { label: "5% OFF", value: "5off", color: "#4F2C22", textColor: "#F0EDE8" },
  { label: "TRY AGAIN", value: "tryagain", color: "#F0EDE8", textColor: "#4F2C22" },
  { label: "15% OFF", value: "15off", color: "#4F2C22", textColor: "#F0EDE8" },
  { label: "FREE GIFT", value: "sample", color: "#F0EDE8", textColor: "#4F2C22" },
];

const SpinWheel = ({ isOpen, onClose, onComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState("");
  const [hasSpun, setHasSpun] = useState(false);
  const [error, setError] = useState("");
  const wheelRef = useRef(null);
  const apiResultRef = useRef(null);

  const spinWheel = async () => {
    if (isSpinning || !email) return;

    setIsSpinning(true);
    setResult(null);
    setError("");

    // Call API first to get the real result
    try {
      const data = await spinWheelApi.spin(email);
      apiResultRef.current = data.prize;
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Try again later.";
      setError(msg);
      setIsSpinning(false);
      return;
    }

    // Find the winning segment index to land on the correct prize
    const winValue = apiResultRef.current.value;
    const winIndex = prizes.findIndex((p) => p.value === winValue);
    const segmentSize = 360 / prizes.length;
    // Calculate rotation to land on the winning segment
    const targetAngle = 360 - (winIndex * segmentSize + segmentSize / 2);
    const spinDegrees = 1440 + targetAngle;
    const newRotation = rotation + spinDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      const prize = apiResultRef.current;
      setResult({
        label: prize.label,
        value: prize.value,
        couponCode: prize.couponCode,
      });
      setIsSpinning(false);
      setHasSpun(true);
    }, 4000);
  };

  const handleClaim = () => {
    onComplete(result);
    onClose();
  };

  if (!isOpen) return null;

  const segmentAngle = 360 / prizes.length;
  const radius = 140;
  const centerX = 150;
  const centerY = 150;

  // Create SVG path for each segment
  const createSegmentPath = (index) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  // Get text position for each segment
  const getTextPosition = (index) => {
    const angle = ((index * segmentAngle) + (segmentAngle / 2) - 90) * (Math.PI / 180);
    const textRadius = radius * 0.65;
    return {
      x: centerX + textRadius * Math.cos(angle),
      y: centerY + textRadius * Math.sin(angle),
      rotation: (index * segmentAngle) + (segmentAngle / 2)
    };
  };

  return (
    <div className="spin-wheel-overlay">
      <div className="spin-wheel-modal">
        <button className="spin-wheel-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="spin-wheel-content">
          <div className="spin-wheel-left">
            <span className="spin-wheel-tag">EXCLUSIVE OFFER</span>
            <h2>Spin & Win</h2>
            <p>Try your luck and win exclusive discounts on our Ayurvedic collection</p>

            {!hasSpun ? (
              <div className="spin-wheel-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                  transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
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
                        style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                      >
                        {prize.label}
                      </text>
                    </g>
                  ))}
                  {/* Center circle */}
                  <circle cx={centerX} cy={centerY} r="35" fill="#4F2C22" stroke="#663532" strokeWidth="3" />
                </svg>
                <div className="wheel-center-logo">
                  <img src="/logo.png" alt="Cleanse" />
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

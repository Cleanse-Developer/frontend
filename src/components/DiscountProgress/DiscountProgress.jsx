"use client";
import "./DiscountProgress.css";
import { useState, useEffect, useRef } from "react";
import { toNum, formatMoney } from "@/lib/formatters";

const CONFETTI_COLORS = [
  "#FFD700", "#FF6B6B", "#4ECDC4", "#A855F7", "#FF9F43",
  "#54A0FF", "#5FD068", "#FF78C4", "#F9CA24", "#00D2D3",
];

/**
 * Cart spending-tier progress bar. Renders backend-computed tier progress
 * (Settings: discount_tier_config). Returns null when tiers are disabled or
 * pricing hasn't loaded yet (tierProgress is null/empty).
 *
 * @param {object|null} tierProgress - pricing.tierProgress from the server:
 *   { milestones: [{threshold, label, type, reached}], nextMilestone, currentLabel, fillPercent }
 * @param {"page"|"drawer"} variant - visual style for the cart page vs the cart drawer.
 */
export default function DiscountProgress({ tierProgress, variant = "page" }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const prevReachedRef = useRef(null);

  // Drop any malformed milestones (missing/non-numeric threshold) defensively.
  const milestones = (tierProgress?.milestones || []).filter(
    (m) => m && toNum(m.threshold) !== null
  );
  const reachedCount = milestones.filter((m) => m.reached).length;

  // Celebrate when a new milestone is reached
  useEffect(() => {
    if (!tierProgress) return;
    const prev = prevReachedRef.current;
    prevReachedRef.current = reachedCount;
    if (prev !== null && reachedCount > prev) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(t);
    }
  }, [reachedCount, tierProgress]);

  if (!tierProgress || milestones.length === 0) return null;

  const { fillPercent = 0, nextMilestone, currentLabel } = tierProgress;

  const confetti = showConfetti
    ? Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          className="dp-confetti-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            backgroundColor:
              CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          }}
        />
      ))
    : null;

  return (
    <div className={`dp dp--${variant} ${showConfetti ? "dp--celebrating" : ""}`}>
      {showConfetti && <div className="dp-confetti">{confetti}</div>}
      <div className="dp-top">
        {nextMilestone ? (
          <p className="dp-msg">
            &#8377;{formatMoney(nextMilestone.amountAway)} away from{" "}
            {nextMilestone.label}
          </p>
        ) : currentLabel ? (
          <p className="dp-msg dp-msg--unlocked">🎉 {currentLabel} unlocked!</p>
        ) : null}
      </div>
      <div className="dp-track">
        <div className="dp-fill" style={{ width: `${fillPercent}%` }} />
      </div>
      <div className="dp-tiers">
        {milestones.map((m, i) => (
          <div
            key={`${m.type}-${m.threshold}-${i}`}
            className={`dp-tier ${m.reached ? "dp-tier--unlocked" : ""}`}
          >
            <span className="dp-tier-price">&#8377;{formatMoney(m.threshold)}</span>
            <span className="dp-tier-label">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

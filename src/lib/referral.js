// Customer referral attribution, stored client-side.
//
// A referral share link lands the visitor on `/login?tab=register&ref=<CODE>`
// (built by the profile page's share buttons). The code has to survive whatever
// the visitor does next — browse around, sign up from the login page, via Google,
// or from the OTP step inside checkout — because the backend only applies a
// referral AT SIGNUP. Persisting it here means every signup path can send it,
// instead of the code being lost the moment they navigate away from the link.
//
// Mirrors lib/affiliate.js (promoter attribution). Kept separate on purpose:
// promoter = commission on orders, referral = customer reward at first order.

const KEY = "referral_code";
const WINDOW_DAYS = 30;

// Read `?ref` off the current URL and persist it (last link wins).
export function captureFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const code = new URLSearchParams(window.location.search).get("ref");
    if (!code || !code.trim()) return;
    localStorage.setItem(
      KEY,
      JSON.stringify({ code: code.trim().toUpperCase(), ts: Date.now() })
    );
  } catch {
    /* storage unavailable — ignore */
  }
}

// The stored referral code, or null if absent/expired.
export function getStoredReferralCode() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.code) return null;
    if (data.ts && Date.now() - data.ts > WINDOW_DAYS * 864e5) {
      localStorage.removeItem(KEY);
      return null;
    }
    return data.code;
  } catch {
    return null;
  }
}

// Drop the code once an account has actually been created with it.
export function clearReferralCode() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

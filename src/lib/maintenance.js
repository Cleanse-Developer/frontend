/* Server-only. Reads the maintenance switch for the root layout gate.
 *
 * This runs on EVERY document render, so it is built around three constraints:
 *
 *  - Small payload. /settings/maintenance exists precisely so this isn't fetching
 *    the whole CMS (/settings/public) just to read one boolean.
 *  - Bounded latency. A 1.5s abort keeps a sick settings endpoint from adding
 *    seconds to TTFB, and a 5s module-scope memo keeps this to ~12 upstream calls
 *    per minute per instance instead of one per request.
 *  - FAIL OPEN. See getMaintenance below — this is the part that matters.
 */

const OFF = { enabled: false };

/* Last-resort copy, used only when maintenance is ON but the settings fetch produced
 * nothing (API unreachable, or MAINTENANCE_FORCE=1 on a cold cache). Without this the
 * screen would render with no words on it — which is the one thing a maintenance page
 * must never do, since communicating is its entire job. Kept deliberately generic;
 * the real copy is admin-authored and lives in the DB.
 */
const FALLBACK_COPY = {
  eyebrow: "Pardon the pause",
  heading: "We are tending\nto something",
  message:
    "Cleanse is briefly closed for maintenance and will reopen shortly. Thank you for your patience.",
  revisitNote: "Please look in on us again in a little while.",
  showBranches: true,
};

const TTL_MS = Number(process.env.MAINTENANCE_TTL_MS) || 5000;

// Module scope survives across requests within a server instance.
let cache = { value: null, expiresAt: 0 };
// Shared so a burst on a cold cache makes one upstream call, not N.
let inFlight = null;

function apiBase() {
  // Runtime var first: NEXT_PUBLIC_* is inlined at build time, so ops can only
  // point the server at an internal origin via a plain (non-public) var.
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api"
  );
}

async function readFlag() {
  try {
    const res = await fetch(`${apiBase()}/settings/maintenance`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    // null, not OFF — the caller prefers the last known good value over a default.
    return null;
  }
}

async function resolve() {
  const now = Date.now();
  if (cache.value && now < cache.expiresAt) return cache.value;

  if (!inFlight) {
    inFlight = readFlag().finally(() => {
      inFlight = null;
    });
  }
  const fresh = await inFlight;

  if (fresh) {
    cache = { value: fresh, expiresAt: Date.now() + TTL_MS };
    return fresh;
  }

  // Fetch failed. Prefer the last good value; otherwise stay open.
  return cache.value || OFF;
}

/**
 * Resolve the maintenance state. Always returns an object with `enabled`, and always
 * with usable copy when `enabled` is true.
 *
 * IMPORTANT — the failure direction is deliberate and load-bearing. On a timeout, a
 * throw, or a non-2xx we fall back to the last known good value and then to
 * `{ enabled: false }`. A network blip must NEVER be able to put the storefront into
 * maintenance: the most likely reason someone wants this switch is that the backend is
 * already unwell, and an unreachable settings endpoint blacking out the store would
 * turn a partial outage into a total one.
 *
 * To take the site down when the API itself is unreachable, set MAINTENANCE_FORCE=1.
 * That overrides `enabled` only — the copy is still fetched when it can be, so a
 * forced preview shows the real admin-authored text rather than the fallback.
 */
export async function getMaintenance() {
  const forced = process.env.MAINTENANCE_FORCE === "1";
  const value = await resolve();

  if (!forced && !value.enabled) return value;

  // On from here. Backfill any field the fetch could not supply so the screen always
  // has something to say.
  return { ...FALLBACK_COPY, ...value, enabled: true };
}

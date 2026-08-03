import { NextResponse } from "next/server";

/* Staff bypass for maintenance mode — and nothing else.
 *
 * The maintenance DECISION lives in src/app/layout.js. This file exists only because
 * a layout cannot set a cookie or issue a redirect, and the bypass needs both.
 *
 * Named proxy.js, not middleware.js: Next 16 deprecated the `middleware` file
 * convention in favour of `proxy`, and having both present is a build error.
 *
 * Flow:
 *   /any/path?preview=<token>  ->  set cookie, 307 to the same path without the param
 *   /any/path?preview=off      ->  clear cookie, 307 to the same path
 *   cookie present & valid     ->  pass through, marked uncacheable
 */

const COOKIE = "cleanse_maint_bypass";
const MAX_AGE_S = 8 * 60 * 60; // 8h — long enough for a maintenance window.

// A CDN must never cache a staff member's real-site render and then serve it to the
// public. This is the one way the bypass can go badly wrong, so every bypassed
// response is marked private and keyed on the cookie.
function markUncacheable(res) {
  res.headers.set("Cache-Control", "private, no-store, must-revalidate");
  res.headers.set("Vary", "Cookie");
  return res;
}

function stripPreview(url) {
  const clean = new URL(url);
  clean.searchParams.delete("preview");
  return clean;
}

export default function proxy(request) {
  // Server-only var. Never NEXT_PUBLIC_* — that gets inlined into the client bundle
  // at build time, which would publish the token to every visitor.
  const token = process.env.MAINTENANCE_BYPASS_TOKEN;
  const preview = request.nextUrl.searchParams.get("preview");

  if (preview === "off") {
    const res = NextResponse.redirect(stripPreview(request.nextUrl), 307);
    res.cookies.delete({ name: COOKIE, path: "/" });
    return markUncacheable(res);
  }

  // Not a timing-safe compare, deliberately: this is a staff convenience for viewing
  // a site that is normally public, not an authorization boundary. Nothing behind it
  // is privileged.
  if (preview && token && preview === token) {
    // Redirecting rather than just setting the cookie keeps the token out of the
    // address bar, the Referer header on every subsequent request, and analytics.
    const res = NextResponse.redirect(stripPreview(request.nextUrl), 307);
    res.cookies.set({
      name: COOKIE,
      value: token,
      httpOnly: true,
      // Off in dev: a `secure` cookie is silently dropped over plain-http localhost,
      // which makes the bypass look broken locally for no reason.
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_S,
    });
    return markUncacheable(res);
  }

  if (token && request.cookies.get(COOKIE)?.value === token) {
    return markUncacheable(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  // Documents only. Skipping Next's own assets and static files keeps this off the
  // hot path for everything the maintenance screen itself needs to load.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|font/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff|woff2|ttf|otf|mp4|webm)$).*)",
  ],
};

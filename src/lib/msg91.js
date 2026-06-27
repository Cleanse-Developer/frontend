// MSG91 OTP widget loader (custom-UI mode, exposeMethods:true).
//
// Mirrors lib/razorpay.js: lazy-load an external SDK once, then drive it from
// our own UI. With exposeMethods:true the widget shows no popup and instead
// attaches window.sendOtp / verifyOtp / retryOtp, which we wrap as Promises so
// the existing async/await handlers in the login page keep working.

let widgetReady = false;
let initPromise = null;

const SCRIPT_URLS = [
  "https://verify.msg91.com/otp-provider.js",
  "https://verify.phone91.com/otp-provider.js",
];

// Try each script URL in order; resolve true on the first that loads.
function injectScript(urls, i = 0) {
  return new Promise((resolve) => {
    if (i >= urls.length) {
      resolve(false);
      return;
    }
    const script = document.createElement("script");
    script.src = urls[i];
    script.async = true;
    script.dataset.msg91 = "true";
    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove();
      resolve(injectScript(urls, i + 1));
    };
    document.head.appendChild(script);
  });
}

// Loads + initializes the widget at most once. Resolves false if the widget
// can't be configured/loaded so callers can fall back gracefully.
export function loadMsg91() {
  if (widgetReady) return Promise.resolve(true);
  if (initPromise) return initPromise;

  const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
  const tokenAuth = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH;
  if (!widgetId || !tokenAuth) {
    return Promise.resolve(false);
  }

  initPromise = injectScript(SCRIPT_URLS).then((loaded) => {
    if (!loaded || typeof window.initSendOTP !== "function") {
      initPromise = null; // allow a later retry
      return false;
    }
    window.initSendOTP({
      widgetId,
      tokenAuth,
      exposeMethods: true,
      success: () => {},
      failure: () => {},
    });
    widgetReady = true;
    return true;
  });

  return initPromise;
}

// Send an OTP. identifier = country code + number, no "+" (e.g. "919179621765").
export function sendOtpViaWidget(identifier) {
  return new Promise((resolve, reject) => {
    if (typeof window.sendOtp !== "function") {
      reject(new Error("OTP service not ready"));
      return;
    }
    window.sendOtp(identifier, resolve, reject);
  });
}

// Verify an OTP. On success the callback receives data containing an
// access-token (JWT) for server-side verification.
export function verifyOtpViaWidget(otp) {
  return new Promise((resolve, reject) => {
    if (typeof window.verifyOtp !== "function") {
      reject(new Error("OTP service not ready"));
      return;
    }
    window.verifyOtp(otp, resolve, reject);
  });
}

// Resend the OTP on the existing request. channel "11" = text SMS.
export function retryOtpViaWidget(channel = "11") {
  return new Promise((resolve, reject) => {
    if (typeof window.retryOtp !== "function") {
      reject(new Error("OTP service not ready"));
      return;
    }
    window.retryOtp(channel, resolve, reject);
  });
}

// Normalize the verifyOtp success payload to the raw access-token string.
// Shape varies across SDK versions, so check the common spots.
export function extractWidgetToken(data) {
  if (!data) return null;
  if (typeof data === "string") return data;
  return data.message || data["access-token"] || data.accessToken || data.authToken || null;
}

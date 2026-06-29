// Google Sign-In loader (auth-code popup flow).
//
// Loads the Google Identity Services SDK once, then opens a popup that returns a
// one-time auth code. The code is sent to our backend, which exchanges it for
// tokens (using the client secret), verifies the ID token, and issues a session.
// Mirrors the lazy-load pattern in lib/msg91.js / lib/razorpay.js.

let scriptPromise = null;
const GSI_SRC = "https://accounts.google.com/gsi/client";

function loadGsi() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.google?.accounts?.oauth2) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(!!window.google?.accounts?.oauth2);
    s.onerror = () => {
      scriptPromise = null; // allow a later retry
      resolve(false);
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

// Opens the Google popup and resolves with the one-time auth code.
// Rejects if the SDK can't load, isn't configured, or the user cancels.
export async function signInWithGoogle() {
  const ok = await loadGsi();
  if (!ok) throw new Error("Couldn't load Google sign-in. Please try again.");

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google sign-in is not configured.");

  return new Promise((resolve, reject) => {
    const codeClient = window.google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: "openid email profile",
      ux_mode: "popup",
      callback: (response) => {
        if (response && response.code) resolve(response.code);
        else reject(new Error(response?.error || "Google sign-in cancelled"));
      },
      error_callback: (err) =>
        reject(new Error(err?.message || "Google sign-in cancelled")),
    });
    codeClient.requestCode();
  });
}

// Checkout form data persistence with TTL (30 minutes)

const STORAGE_KEY = "cleanse_checkout_data";
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export function saveCheckoutData(data) {
  try {
    const payload = {
      ...data,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function loadCheckoutData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data.savedAt) return null;

    // Check TTL
    if (Date.now() - data.savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function clearCheckoutData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent fail
  }
}

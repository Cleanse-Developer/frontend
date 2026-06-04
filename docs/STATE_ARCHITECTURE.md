# State Architecture — Cleanse Storefront

## Summary
- **No Zustand.** All shared state is React Context.
- **5 contexts**: Auth, Settings, Toast, Cart, Popup.
- **API layer**: a single axios instance (`src/lib/api.js`) with token-refresh
  interceptors, and a domain-grouped endpoints module (`src/lib/endpoints.js`).
- **Persistence**: `localStorage` for the auth token, the guest cart, and
  checkout form data.

## Contexts

### AuthContext — `src/context/AuthContext.jsx` · hook `useAuth()`
Value: `{ user, isAuthenticated, isLoading, sendOtp, login, loginWithPassword, register, logout, refreshProfile }`.
- Restores the session on mount from `localStorage.accessToken` via `userApi.getProfile()`.
- Listens for `window` event `"auth:logout"` (dispatched by the api interceptor on a failed refresh).
- Must be the outermost data provider (Cart depends on it).

### SettingsContext — `src/context/SettingsContext.jsx` · hook `useSettings()`
Value: merged `DEFAULTS` + `settingsApi.getPublic()` response. Read-only (no setters).
Holds all CMS-driven content: `promoBanner`, `cmsHero`, `cmsFormula`, `cmsMarquee`, `cmsBento`, `cmsCta`, `cmsPeelReveal`, `cmsHeader`, `cmsFooter`, plus `socialLinks`, `freeShippingThreshold`, popups config. Fetched once on mount; static for the session. *(Note: a few labels are currently force-set in components because the backend still serves placeholder values — see COMPONENT_MAP.md.)*

### CartContext — `src/context/CartContext.jsx` · hook `useCart()`
Value: `{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, subtotal, isCartOpen, setIsCartOpen, serverPricing, fetchPricingPreview }`.
- Action signatures: `addToCart(product, selectedSize, quantity = 1)`, `removeFromCart(cartItemId)`, `updateQuantity(cartItemId, newQuantity)`.
- Guest cart persisted to `localStorage.cleanse_cart`; merged into the authenticated cart on login.
- Uses `cartApi` (auth) / `guestPricingApi` (guest); fetches a server pricing preview (coupons, gift wrap, loyalty) for both.
- `cartCount` = Σ quantity; `subtotal` = Σ price × quantity.

### ToastContext — `src/context/ToastContext.jsx` · hook `useToast()`
Value: `{ success(msg), error(msg), info(msg) }`. Renders a fixed toast stack; auto-dismiss ~3s. (Presentational `Toast` extracted to `ui/feedback/Toast.jsx`.)

### PopupContext — `src/context/PopupContext.jsx` · hook `usePopupManager()`
Value: `{ requestOpen(id), release(id), isActive(id), onRelease(cb) }`. Singleton — only one popup open at a time (uses refs, no re-render). The `ui/overlays/Popup` component coordinates through it.

## Provider nesting — `src/app/layout.js`
```
ErrorBoundary
└ AuthProvider
  └ SettingsProvider
    └ ToastProvider
      └ CartProvider
        └ PopupProvider
          └ TransitionProvider
            └ ClientLayout (Menu header + children + Footer)
               ├ ShoppingCart
               ├ SpinWheelWrapper
               └ NewsletterPopupWrapper
```

## API layer
- **`src/lib/api.js`** — axios instance; `baseURL` = `NEXT_PUBLIC_API_URL`.
  - Request interceptor attaches `Authorization` from `localStorage.accessToken`.
  - Response interceptor: on 401 → attempt refresh (queues concurrent failures); on refresh failure → clear token + dispatch `auth:logout`.
- **`src/lib/endpoints.js`** — domain groups: `productApi`, `authApi`, `cartApi`, `cartPricingApi`, `guestPricingApi`, `orderApi`, `userApi`, `addressApi`, `wishlistApi`, `couponApi`, `specialCouponApi`, `reviewApi`, `shippingApi`, `newsletterApi`, `contactApi`, `referralApi`, `loyaltyApi`, `testimonialApi`, `spinWheelApi`, `socialProofApi`, `settingsApi`.

## localStorage keys
- `accessToken` — auth session (AuthContext + api interceptor).
- `cleanse_cart` — guest cart (CartContext).
- `cleanse_checkout_data` — checkout form draft, 30-min TTL (`src/lib/checkoutStorage.js`).

## Data flow
```
Component → useCart/useAuth/useSettings → Provider → *Api (endpoints) → api (axios)
                                                             ├ attach token
                                                             └ 401 → refresh / auth:logout
```

## How the UI library relates
- UI components are **presentational by default** (e.g. `CartItem` takes
  `onQuantityChange`/`onRemove`) so they don't hard-couple to contexts.
- The few that need state read the existing contexts directly: `AddToCartButton`
  → `useCart`; `Popup` → `usePopupManager`. No new stores/contexts are introduced.

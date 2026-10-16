# Analytics — Google (GTM / Google tag) + Meta Pixel + Conversions API relay

## Where things live

| File | Role |
| --- | --- |
| `src/lib/tracking.js` | Every event. The only module that touches `dataLayer` / `gtag` / `fbq`. |
| `src/components/Tracking/Tracking.jsx` | Loads the tags, identifies the signed-in user, tracks route changes. Also the `<noscript>` fallbacks. |
| `src/app/layout.js` | Mounts `<TrackingNoScript />` at the top of `<body>` and `<Tracking />` inside `AuthProvider`. |
| `backend: src/services/metaCapi.service.js` | Receives the relayed events (`POST /api/ev`) and the order's `tracking` block; sends them to Meta's Conversions API. |

Page and component code calls the `track*` helpers; it never talks to a tag
directly. That is what keeps GA4 and Meta reporting the same items, the same
currency and the same value for a given action.

## Configuration

```
NEXT_PUBLIC_GTM_ID=GTM-MQN2C2VT                # one or more, comma/space separated
NEXT_PUBLIC_META_PIXEL_ID=662202292509283
NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL=         # optional, see Google Ads below
NEXT_PUBLIC_CURRENCY=INR                       # optional, defaults to INR
NEXT_PUBLIC_ANALYTICS_DEV=true                 # optional, load tags in dev too
NEXT_PUBLIC_ANALYTICS_DEBUG=true               # optional, console.debug every event
```

All are `NEXT_PUBLIC_`, inlined into the client bundle at build time. That is fine
for public tag IDs, but a change needs a rebuild, not just a restart.

If `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_META_PIXEL_ID` are unset the code falls back
to the production container (`GTM-MQN2C2VT`) and pixel, so a build without env still
measures. `.env.production` deliberately does not set them.

**Tags load in production builds only.** Local dev would otherwise write test
orders into the real GA4 property and the Pixel's conversion history, which is very
hard to unpick afterwards. Set `NEXT_PUBLIC_ANALYTICS_DEV=true` (shell or `.env`,
not committed) to opt a dev machine in while wiring things up. With tags off every
`track*` call is a no-op, and `trackPurchase` does not burn its once-per-order guard.

Backend (separate repo): `META_CAPI_ACCESS_TOKEN` (the relay does nothing without
it), `META_PIXEL_ID`, `META_CAPI_TEST_CODE`, `META_GRAPH_VERSION`.

### GTM- vs GT- — they are different products

`NEXT_PUBLIC_GTM_ID` is a list and `tracking.js` routes each ID by prefix:

| Prefix | Loader | How events are sent |
| --- | --- | --- |
| `GTM-` | `gtm.js` container | `dataLayer.push({event, ...params, ecommerce: {...}})`, with an `ecommerce: null` reset first |
| `GT-`, `G-`, `AW-` | `gtag.js` | `gtag('event', name, {...flat params})` |

A Google tag (`GT-`) ignores a plain `dataLayer.push` with an `event` key and wants
the GA4 ecommerce fields flat rather than nested. Both paths can run at once.
`gtag/js` is fetched once with the first ID, then each destination gets its own
`gtag('config', ...)`; loading it per ID would re-run the library and double-count.

The container path also receives our identity fields (`event_id`, `session_id`,
`session_number`, `client_id`, `user_id`, `user_data`) for use as Data Layer
Variables. The Google-tag path deliberately does **not**: GA4 treats a `client_id`
parameter as an identity override, and gtag.js keeps its own session.

**Page views on the Google-tag path.** gtag.js reports the landing page itself when
it `config`s; we send only later client-side navigations. If the GA4 stream has
Enhanced measurement → "Page changes based on browser history events" on, turn it
off or navigations count twice. Containers get every page view from us (the
container's GA4 tags fire on the `page_view` Custom Event trigger).

`<noscript>`: the GTM iframe takes exactly one container, so it uses the first
`GTM-` ID and is omitted when only Google tags are configured.

### Google Ads

A `AW-` ID in the list gives Ads its remarketing tag. **Conversions need one more
step**, and the two ways are mutually exclusive:

1. **Import from GA4** (default). Google Ads → Goals → Conversions → Import → GA4,
   pick `purchase`. Leave `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` blank.
2. **Fire it directly.** Copy the label from the conversion's Tag setup
   (`send_to: 'AW-XXXX/LABEL'`) into `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL`;
   `trackPurchase` then also emits a `conversion` event.

Do **not** do both — every order would be counted twice.

## Events

Every ecommerce event carries GA4's `items[]`, and its Meta counterpart the matching
`content_ids` / `contents` / `value` / `currency`. Both copies share an `event_id`
(`eventID` on `fbq`), so Meta deduplicates the browser and server copies.

| Trigger | Google | Meta Pixel | Relayed to CAPI |
| --- | --- | --- | --- |
| Page load (once) / route change | `page_view` | `PageView` (landing only; later ones come from the pixel's own history hook) | landing only |
| Product page loads | `view_item` | `ViewContent` | yes |
| Wardrobe results settle | `view_item_list` | — | — |
| `?search=` on wardrobe | `search` | `Search` | no |
| Anything adds to the bag (incl. "+" in the bag) | `add_to_cart` | `AddToCart` | yes |
| Line removed from the bag | `remove_from_cart` | — | — |
| Bag drawer opens | `view_cart` | — | — |
| Checkout with a non-empty cart | `begin_checkout` | `InitiateCheckout` | yes |
| Checkout step 1 → 2 | `add_shipping_info` | — | — |
| Checkout step 2 → 3 | `add_payment_info` | `AddPaymentInfo` | yes |
| Order confirmed | `purchase` | `Purchase` | **no — the backend sends it** |
| Login (password / OTP / Google / checkout OTP) | `login` | `Login` (custom) | no |
| First-time account creation | `sign_up` | `CompleteRegistration` | no |
| Newsletter popup, footer form, spin-wheel claim | `generate_lead` | `Lead` | no |

The relay is limited to the five events the backend accepts
(`metaCapi.service.js`). Adding Search / Lead / CompleteRegistration server-side
means extending that allow-list and its field filter first.

### Where they fire, and why there

- **`add_to_cart` lives in `CartContext`** (`addToCart` and `updateQuantity`), not at
  the many call sites, so every path is counted once with the variant and price the
  bag actually billed.
- **`view_cart` is keyed on `isCartOpen` alone**, reading the lines through a ref;
  depending on `cartItems` would re-fire it on every quantity tick.
- **`remove_from_cart` reads the line through a ref** and skips reporting if the
  server call failed (the line is still in the bag).
- **`purchase` is driven off `placedOrder`**, not the places that set it (COD,
  Razorpay confirm, and the recovery paths that poll for the order). `trackPurchase`
  is idempotent per order id (last 50, `localStorage`, so it holds across tabs).
  Its `event_id` is `purchase_<orderId>`, which must match the backend's server-side
  Purchase so Meta counts the order once.
- **Funnel steps fire only on the forward transition** in `goToStep` (it is also how
  the step chips go backwards). `add_payment_info` is on step 2 → 3, not on every
  "Place order" click, so failed/retried attempts do not re-fire it.
- **The first Meta `PageView` is the only manual one.** fbevents.js accepts one per
  page load and fires the rest from its own `history.pushState` hook.
- **Advanced matching:** the pixel `init` waits for auth, then carries
  email/phone/name/`external_id` (Meta hashes them in the browser). It can be
  updated once if a guest identifies themselves later in the same page load.

## Configuring the container / property

Nothing in GA4 or Meta is configured from code beyond the base snippets. On the
Google-tag path (`GT-`) the events arrive as GA4 events and just need marking as key
events (GA4 → Admin → Events). On a container path they arrive as dataLayer events
and need GA4 Event tags with matching Custom Event triggers, reading `{{ecommerce}}`
via the built-in ecommerce variable. Meta's standard event names map to the Pixel's
built-in conversions. Verify with Meta's Pixel Helper, Google's Tag Assistant, and
`NEXT_PUBLIC_ANALYTICS_DEBUG=true`.

## Known gaps

- **Consent management.** No cookie banner, so tags load unconditionally. Needs
  Google Consent Mode v2 and Meta's consent flag before serving the EU/UK.
- **PII in the dataLayer.** `user_data` (raw email / phone / name) rides on every
  container event so GTM's user-provided-data variable can hash it. Make sure no
  tag forwards it unhashed.
- **Tags on the maintenance screen.** Absent on purpose from that branch of
  `layout.js` — every hit there is staff or a bot.

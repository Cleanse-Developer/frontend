# UI Audit — Cleanse Storefront

A full inventory of the existing UI, produced while extracting the design system
(`src/design-system/`) and UI library (`src/ui/`). Stack: **Next.js 16 App
Router, JavaScript, plain CSS, GSAP, Three.js, React Context**.

---

## 1. Reusable components (existing `src/components/`)

| Component | Role |
|---|---|
| Menu | Fixed header / navbar (scroll states, locale capsule, overlay menu, GSAP scramble) |
| Footer | Footer with hover dropdowns, socials, CMS links |
| ShoppingCart | Cart drawer (timers, cross-sell, loyalty, pricing) |
| Product | Product tile (image, name, price, add-to-cart) |
| FeaturedSection | "OUR BEST SELLERS" grid + bento + shop-by-category + build-your-ritual |
| ShopByProduct | Category showcase with product cards + rating |
| Testimonials | Review carousel (fluid bg, active states, stars) |
| BeforeAfter | Before/after reveal cards |
| RitualBanner | Day/night ritual cards |
| BlogSection | Blog card grid (parallax images) |
| CTA | Call-to-action band with parallax side images |
| NewsletterPopup / FOMOPopup | Marketing modals/popups (single-popup manager) |
| ContactForm | Contact form card over parallax image |
| Preloader | Intro loader (SplitText logo) |
| Orb | Three.js image sphere (OrbitControls) |
| Copy | Text reveal wrapper (SplitText flicker / lines) |
| MarqueeBanner / TaglineMarquee | Scrolling marquees |
| LeafSpread / ImageTrail / DotMatrix / HoverWord / TextReveal / TextBlock | Decorative/animation utilities |
| Logo / BrandIcon | Brand marks |
| SpinWheel / WhatsAppButton / ChatSupport / NewsletterPopupWrapper | Marketing/support widgets |
| ErrorBoundary | Error boundary |

## 2. Repeated layouts
- **Section band**: full-bleed bg + `padding-block: var(--section-py)` + centered content at `var(--page-max)` with `var(--gutter)` inline padding. (home, wardrobe, genesis, ritual, testimonials, featured…)
- **Hero header**: breadcrumb + big uppercase title (+ subtitle). `/wardrobe`, `/blog`.
- **Equal-column card grids**: `grid-template-columns: repeat(N, 1fr)` + gap. Products (4), categories (3), bento.
- **Overlay/modal**: `position: fixed; inset: 0;` backdrop with blur + centered/edge panel. Newsletter, FOMO, cart, menu overlay.

## 3. Repeated CSS patterns (consolidation targets)
| Pattern | Canonical source | Design-system class |
|---|---|---|
| Pill CTA | `.featured-cta-btn`, `.sbp-cta`, `.rhr-cta` | `.ds-btn--pill` / `<Button variant="pill">` |
| Rect button | `.add-to-cart-btn`, `.product-card-buy-btn` | `.ds-btn--rect` / `<Button variant="rect">` |
| Hero button | `.hero-btn` | `.ds-btn--hero` / `<Button variant="hero">` |
| White/tan card | `.featured-card`, product/testimonial cards | `.ds-card` / `.ds-card--tan` |
| Section title | `.featured-section-title`, `.products-section-title`, `.testimonials-title h2`, `.formulas-tagline` (all `var(--fs-section-title)`) | `.ds-section-title` |
| Eyebrow/label | `.newsletter-tag`, `.testimonials-label p`, `.menu-locale-group-label` | `.ds-eyebrow` |
| Badge/chip | `.menu-locale-pill` | `.ds-badge` / `<Badge>` |
| Container | `.featured-grid`, `.products-grid`, `.testimonials .container` (all `var(--page-max)` + `margin:auto`) | `.ds-container` / `<Container>` |
| Grid | `.sbc-grid`, `.products-grid`, `.byr-grid` | `.ds-grid--{2,3,4}` / `<Grid>` |

## 4. Spacing system
Defined in `globals.css :root` (responsive at 480 / 1199-portrait / 1440 / 1920 / 2560):
- `--gutter`: 2rem (1rem → 6rem across breakpoints)
- `--page-max`: 1300px (→ 2100px)
- `--section-py`: 5rem (3rem → 7rem)
Ad-hoc spacing is on a 0.25rem step scale (see `tokens/spacing.js`).

## 5. Typography system
- Families: **Caelune Beauty** (`--font-heading`, display) + **Lexend** (`--font-body`).
- Headings h1–h5: fluid `clamp()` sizes, uppercase, weight 400, line-height 0.9.
- Role tokens: `--fs-card-title/price/desc/btn/tag`, `--fs-section-title: clamp(1.5rem,3vw,2.5rem)`.
- Body: base `clamp(0.8rem,0.75vw,0.85rem)` + `.md`/`.lg`/`.bodyCopy` variants.
- Buttons: uppercase Lexend, weight 500, `clamp(0.85rem,1vw,0.85rem)`.
Full values mirrored in `tokens/typography.js` and `styles/typography.css`.

## 6. Color system
Brand scale (`globals.css :root`): `--base-100 #E7D0A6` · `--base-200 #9E9268` · `--base-300 #84592C` · `--base-400 #722F14` · `--base-500 #5A2510` · `--base-600 #422D1C` · `--base-700 #2E1F14`.
Recurring non-token colors: `#F0EDE8` (cream band), `#FFFFFF`, `#C8AD73` (gold), `#D9C9A8` (tan card), `#663532`, `#442824`, `#4F2C22` (blog), `#8B5A2B` (menu accent). See `tokens/colors.js`.

## 7. Animation patterns (GSAP)
Plugins registered ad-hoc per file; `useGSAP` (@gsap/react) used widely. Patterns → reusable helpers in `src/ui/animations/`:
| Pattern | Source | Helper |
|---|---|---|
| fade/rise-in | RitualBanner, BeforeAfter | `fadeInUp` |
| text reveal (SplitText flicker) + scramble | Copy, Menu | `flickerReveal`, `scramble` |
| y parallax (scrubbed) | BlogSection, CTA | `yParallax` |
| plugin register + refresh | FeaturedSection, page.js | `registerScrollTrigger`, `refreshSoon` |
| pinned peel reveal | PeelReveal | `peelReveal` |
Other bespoke effects (LeafSpread physics, ImageTrail cursor trail, Menu open/close timeline, Preloader) remain in their components.

## 8. Three.js
Single usage: **Orb** (`components/Orb/Orb.jsx`) — Fibonacci-sphere of image-textured planes, rounded-corner alphaMap, OrbitControls, own RAF loop. Reusable boilerplate (renderer config, scene/camera/controls/loop) extracted to `src/ui/3d/WebGLCanvas.js` + `SceneWrapper.js`; Orb re-exported via `src/ui/3d/Orb.js`.

## 9. Commerce-specific UI patterns
Product tile, product grid, price (₹), discount chip, rating stars, review card, cart drawer + line item, quantity stepper, coupon entry, checkout stepper + summary, address card/form, order card, wishlist heart, add-to-cart. All mapped to `src/ui/commerce/` (+ `forms/`). State comes from `CartContext` (`addToCart(product, size, qty)`, `removeFromCart(id)`, `updateQuantity(id, qty)`); see STATE_ARCHITECTURE.md.

---

See **COMPONENT_MAP.md** for source→library mapping and migration steps, and
**STATE_ARCHITECTURE.md** for the state model.

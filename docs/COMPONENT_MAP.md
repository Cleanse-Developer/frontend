# Component Map — existing UI → `src/ui` library

How each UI-library export relates to the existing code, its dependencies, and
how to adopt it. **The library is additive**: existing pages/components are
unchanged. "Build" = new component replicating the canonical CSS verbatim;
"Wrap" = thin re-export of an existing feature component (preserved 1:1).

`@/ui` re-exports everything; global tokens/utilities load once via
`@/design-system/styles/index.css` in `src/app/layout.js`.

## Primitives (`src/ui/primitives`)
| Export | Kind | Source pattern | Deps | Adopt |
|---|---|---|---|---|
| Button | Build | `.hero-btn`, `.featured-cta-btn`, `.add-to-cart-btn`, globals `button.primary/.secondary` | — | `<Button variant="pill\|rect\|hero\|primary\|secondary">`; `as={Link}` for links |
| Input / Textarea | Build | contact/newsletter/checkout fields | — | controlled `value`/`onChange` |
| Badge | Build | `.menu-locale-pill` chip | — | `<Badge tone="solid\|soft\|outline">` |
| Avatar | Build | `.testimonial-avatar` / `.avatar-placeholder` | — | `src` or `name` (initials) |
| IconButton | Build | `.menu-action-btn` | — | pass an svg + `aria-label` |
| Loader | Build | new (Preloader is the full intro) | — | inline spinner |
| Divider | Build | new | — | `orientation` |

## Layout (`src/ui/layout`)
| Export | Kind | Source | Adopt |
|---|---|---|---|
| Container | Build | `.ds-container` (`--page-max`+`--gutter`) | wrap section content |
| Section | Build | section band (`--section-py`) | `<Section>` (optionally `contained={false}`) |
| Grid | Build | `repeat(N,1fr)` grids | `<Grid cols={2\|3\|4}>` |
| Stack | Build | flex column/row + gap | `<Stack direction>` |
| PageHeader | Build | `.wardrobe-hero` / `.blog-hero` header (title `clamp(2.5rem,6vw,4rem)`) | `<PageHeader breadcrumb title subtitle>` |

## Navigation (`src/ui/navigation`)
| Export | Kind | Source | Deps |
|---|---|---|---|
| Navbar | **Wrap** | `components/Menu/Menu.jsx` | CartContext, SettingsContext, GSAP SplitText |
| Footer | **Wrap** | `components/Footer/Footer.jsx` | SettingsContext |
| Breadcrumbs | Build | `.blog-breadcrumb` / `.wardrobe-breadcrumb` | `items=[{label,href}]`, `LinkComponent` |
| Pagination | Build | new | controlled `page`/`totalPages`/`onPageChange` |

## Forms (`src/ui/forms`)
| Export | Kind | Source | Adopt |
|---|---|---|---|
| SearchInput | Build | Menu search bar | `onSubmit(query)` |
| QuantitySelector | Build | cart qty stepper | `value`/`onChange`, `min`/`max` |
| AddressForm | Build | `app/checkout` address fields | `onSubmit(address)` |
| CouponInput | Build | cart pricing coupon entry | `onApply(code)`, `applied`/`error` |

## Overlays (`src/ui/overlays`)
| Export | Kind | Source | Deps |
|---|---|---|---|
| Modal | Build | NewsletterPopup modal | Esc/backdrop close, body-scroll lock |
| Drawer | Build | ShoppingCart drawer (generic) | side `left`/`right` |
| Popup | Build | FOMO/Newsletter corner popup | `usePopupManager` (PopupContext) |
| Tooltip | Build | new | CSS hover/focus |

## Feedback (`src/ui/feedback`)
| Export | Kind | Source | Note |
|---|---|---|---|
| Toast | Build | presentational piece of ToastContext | live system stays in `useToast` |
| Alert | Build | new | inline message box |
| EmptyState | Build | empty cart/wishlist screens | icon+title+message+action |
| Skeleton | Build | new | shimmer placeholder |

## Commerce (`src/ui/commerce`)
| Export | Kind | Source | Deps |
|---|---|---|---|
| ProductCard | Build | `components/Product` + `.product-card` | composes PriceDisplay + AddToCartButton |
| ProductGrid | Build | `.products-grid` / `.sbc-grid` | renders ProductCards |
| ProductGallery | Build | product detail gallery | local active state |
| PriceDisplay | Build | `₹{price}` usage | — |
| DiscountBadge | Build | badge/pill | — |
| RatingStars | Build | Testimonials / FeaturedSection stars | read-only |
| ReviewCard | Build | Testimonials card | composes Avatar + RatingStars |
| AddToCartButton | Build | `.add-to-cart-btn` | **CartContext** `addToCart(product,size,qty)` |
| WishlistButton | Build | new | controllable `active`/`onToggle` → `wishlistApi` |
| CartItem | Build | ShoppingCart line | callbacks → `updateQuantity`/`removeFromCart` |
| CheckoutStepper | Build | `app/checkout` | `steps`/`current` |
| CheckoutSummary | Build | cart/checkout totals | `lines`/`total` |
| AddressCard | Build | profile/checkout address | `address`, `onSelect/onEdit/onDelete` |
| OrderCard | Build | `app/orders` | `order`, `onView` |
| CartDrawer | **Wrap** | `components/ShoppingCart` | CartContext + pricing/timers |

## Animations (`src/ui/animations`) — extracted GSAP helpers
| Export | Source | Replaces inline code in |
|---|---|---|
| fadeInUp | RitualBanner / BeforeAfter | card entrance fromTo |
| flickerReveal, scramble | Copy / Menu | SplitText flicker + scramble |
| yParallax | BlogSection / CTA | scrubbed image parallax |
| registerScrollTrigger, refreshSoon | FeaturedSection / page.js | plugin register + refresh |
| peelReveal | PeelReveal | pinned scale/radius/headline timeline |

## 3D (`src/ui/3d`)
| Export | Kind | Source |
|---|---|---|
| createRenderer/mountRenderer/disposeRenderer/attachResize | Build | Orb renderer setup |
| createScene/createOrbitControls/startRenderLoop | Build | Orb scene/camera/loop |
| Orb | **Wrap** | `components/Orb/Orb.jsx` |

---

## Migration backlog (opt-in, verify visually per surface)
Existing components are untouched. To consolidate later, replace inline blocks
with the design-system equivalents, one surface at a time, checking the running
app after each:

1. **Buttons** → `.ds-btn--*` / `<Button>`:
   `home.css .hero-btn`, `FeaturedSection.css .featured-cta-btn` / `.product-card-buy-btn` / `.add-to-cart-btn`, `ShopByProduct.css .sbp-cta`, `RitualBanner.css .rhr-cta`, `Testimonials.css .testimonials-btn`.
2. **Section titles** → `.ds-section-title`: `.featured-section-title`, `.products-section-title`, `.sbc-title`, `.byr-title`, `.testimonials-title h2`, `.formulas-tagline`.
3. **Containers/grids** → `.ds-container` / `.ds-grid--*`: `.featured-grid`, `.products-grid`, `.sbc-grid`, `.byr-grid`, `.testimonials .container`.
4. **Eyebrows/badges** → `.ds-eyebrow` / `.ds-badge`: `.newsletter-tag`, `.testimonials-label`, `.menu-locale-*`.
5. **Animations** → import from `@/ui/animations` (e.g. RitualBanner `fadeInUp`, BlogSection `yParallax`, PeelReveal `peelReveal`).
6. **Feature components** → swap deep imports for `@/ui` (`Navbar`, `Footer`, `CartDrawer`, `Orb`) once verified.
7. **Orb internals** → rebuild on `WebGLCanvas` + `SceneWrapper`.

### Known content note
`components/PeelReveal/PeelReveal.jsx` and `context/SettingsContext.jsx` force
the header labels (`Ritual: Sacred` / `Formula: Pure`) and the Bento ingredients
copy, because the backend CMS still serves placeholder values. When the CMS is
updated, revert those to read from `useSettings()`.

"use client";
import "./ui-kit.css";
import { useState } from "react";
import {
  // primitives
  Button, Input, Textarea, Badge, Avatar, IconButton, Loader, Divider,
  // layout
  Container, Grid, Stack,
  // navigation
  Breadcrumbs, Pagination,
  // forms
  SearchInput, QuantitySelector, CouponInput, AddressForm,
  // overlays
  Modal, Drawer, Popup, Tooltip,
  // feedback
  Toast, Alert, EmptyState, Skeleton,
  // commerce
  PriceDisplay, DiscountBadge, RatingStars, ReviewCard, ProductCard, ProductGrid,
  CartItem, CheckoutStepper, CheckoutSummary, AddressCard, OrderCard, WishlistButton,
} from "@/ui";

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9h12l1.5 12H4.5L6 9z" /><path d="M9 9V7a3 3 0 016 0v2" />
  </svg>
);

const SAMPLE_PRODUCTS = [
  { name: "Nourishing Face Serum", price: 1299, compareAtPrice: 1599, discountPercent: 19, primaryImage: "/face.jpg", shortDescription: "Brightening daily serum with turmeric & rose." },
  { name: "Hair Elixir", price: 999, primaryImage: "/skin.jpg", shortDescription: "Strengthening Ayurvedic hair oil." },
  { name: "Body Lotion", price: 749, primaryImage: "/cream.jpg", shortDescription: "Deep, all-day botanical hydration." },
  { name: "Face Cream", price: 1099, compareAtPrice: 1299, discountPercent: 15, primaryImage: "/serum.jpg", shortDescription: "Rich nourishing cream for all skin types." },
];

function Block({ title, children }) {
  return (
    <section className="kit-block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function UiKitPage() {
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [popup, setPopup] = useState(false);
  const [qty, setQty] = useState(1);
  const [page, setPage] = useState(2);

  return (
    <main className="kit">
      <Container>
        <header className="kit-head">
          <h1>Cleanse UI Kit</h1>
          <p>Live showcase of the design system (src/design-system) + UI library (src/ui).</p>
        </header>

        <Block title="Color tokens">
          <div className="kit-row">
            {["100","200","300","400","500","600","700"].map((s) => (
              <div className="kit-swatch" key={s}>
                <span className="kit-chip" style={{ background: `var(--base-${s})` }} />
                <span className="kit-chip-label">base-{s}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Typography">
          <p className="ds-section-title">Section Title</p>
          <span className="ds-eyebrow">Eyebrow label</span>
          <p className="ds-body-copy">Body copy — ancient wisdom, modern stories, the art of Ayurvedic living.</p>
        </Block>

        <Block title="Buttons">
          <div className="kit-row">
            <Button variant="hero">Hero</Button>
            <Button variant="pill">Pill CTA</Button>
            <Button variant="rect">Rect</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="rect" disabled>Disabled</Button>
          </div>
        </Block>

        <Block title="Primitives">
          <div className="kit-row" style={{ alignItems: "flex-start" }}>
            <div className="kit-col">
              <Input placeholder="Input field" />
              <Textarea placeholder="Textarea" />
            </div>
            <Badge tone="solid">Solid</Badge>
            <Badge tone="soft">Soft</Badge>
            <Badge tone="outline">Outline</Badge>
            <Avatar name="Aria Nair" />
            <Avatar src="/face.jpg" name="Photo" />
            <IconButton aria-label="Cart" style={{ color: "var(--base-700)" }}><CartIcon /></IconButton>
            <Loader />
          </div>
          <Divider />
        </Block>

        <Block title="Navigation">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/wardrobe" }, { label: "Serums" }]} />
          <div style={{ marginTop: "1rem" }}>
            <Pagination page={page} totalPages={5} onPageChange={setPage} />
          </div>
          <p className="kit-note">Navbar &amp; Footer are wrappers of the live header/footer (already visible on every page).</p>
        </Block>

        <Block title="Forms">
          <div className="kit-col">
            <SearchInput onSubmit={(q) => alert(`Search: ${q}`)} />
            <div className="kit-row"><QuantitySelector value={qty} onChange={setQty} /> <span className="kit-note">qty: {qty}</span></div>
            <CouponInput onApply={(c) => alert(`Apply: ${c}`)} />
            <AddressForm onSubmit={(a) => alert(JSON.stringify(a, null, 2))} />
          </div>
        </Block>

        <Block title="Overlays">
          <div className="kit-row">
            <Button variant="pill" onClick={() => setModal(true)}>Open Modal</Button>
            <Button variant="pill" onClick={() => setDrawer(true)}>Open Drawer</Button>
            <Button variant="pill" onClick={() => setPopup(true)}>Open Popup</Button>
            <Tooltip label="I'm a tooltip"><Button variant="rect">Hover me</Button></Tooltip>
          </div>
          <Modal open={modal} onClose={() => setModal(false)}>
            <div style={{ padding: "2rem" }}>
              <h3 className="ds-section-title">Modal</h3>
              <p className="ds-body-copy">Centered dialog with backdrop blur, Esc / click-out to close.</p>
            </div>
          </Modal>
          <Drawer open={drawer} onClose={() => setDrawer(false)}>
            <h3 className="ds-section-title">Drawer</h3>
            <p className="kit-note">Slide-in panel (the generic cart-drawer shape).</p>
          </Drawer>
          <Popup id="kit-demo" open={popup} onClose={() => setPopup(false)} position="bottom-right">
            <strong>Promo popup</strong>
            <p className="kit-note">Coordinated by the single-popup manager.</p>
          </Popup>
        </Block>

        <Block title="Feedback">
          <div className="kit-row kit-dark">
            <Toast tone="success">Added to cart</Toast>
            <Toast tone="error">Something went wrong</Toast>
            <Toast tone="info">Heads up</Toast>
          </div>
          <div className="kit-col" style={{ marginTop: "1rem" }}>
            <Alert tone="info" title="Info">Inline informational alert.</Alert>
            <Alert tone="success" title="Success">Order placed.</Alert>
            <Alert tone="warning" title="Warning">Low stock.</Alert>
            <Alert tone="error" title="Error">Payment failed.</Alert>
          </div>
          <div className="kit-row" style={{ marginTop: "1rem" }}>
            <Skeleton variant="rect" width={120} height={120} />
            <div className="kit-col">
              <Skeleton variant="text" width={200} />
              <Skeleton variant="text" width={160} />
              <Skeleton variant="text" width={180} />
            </div>
          </div>
          <EmptyState title="Your cart is empty" message="Browse the shop to add something you love." action={<Button variant="pill">Shop now</Button>} />
        </Block>

        <Block title="Commerce — atoms">
          <div className="kit-row">
            <PriceDisplay price={1299} compareAt={1599} />
            <DiscountBadge percent={19} />
            <RatingStars value={4} showValue />
            <WishlistButton />
          </div>
        </Block>

        <Block title="Commerce — ProductGrid">
          <ProductGrid products={SAMPLE_PRODUCTS} cols={4} />
          <p className="kit-note">Cards include AddToCartButton (wired to CartContext).</p>
        </Block>

        <Block title="Commerce — cart / checkout / orders">
          <Grid cols={2} gap="1.5rem">
            <div>
              <CartItem item={{ name: "Hair Elixir", price: 999, quantity: 2, image: "/skin.jpg" }} onQuantityChange={() => {}} onRemove={() => {}} />
              <div style={{ marginTop: "1.25rem" }}>
                <CheckoutStepper steps={["Cart", "Address", "Payment", "Done"]} current={1} />
              </div>
              <div style={{ marginTop: "1.25rem" }}>
                <AddressCard selected address={{ fullName: "Aria Nair", phone: "+91 90000 00000", line1: "12 Lotus Lane", city: "Pune", state: "MH", pincode: "411001", label: "Home" }} onEdit={() => {}} />
              </div>
            </div>
            <div className="kit-col">
              <CheckoutSummary
                lines={[{ label: "Subtotal", value: 2298 }, { label: "Shipping", value: 0, muted: true }, { label: "Discount", value: 200, negative: true }]}
                total={2098}
              />
              <OrderCard order={{ id: "10231", date: "2 Jun", status: "Delivered", total: 2098, itemCount: 2, thumbnails: ["/face.jpg", "/skin.jpg"] }} onView={() => {}} />
              <ReviewCard name="Aria Nair" role="Verified buyer" rating={5} text="My skin has never felt better. Truly time-honoured formulas." />
            </div>
          </Grid>
        </Block>
      </Container>
    </main>
  );
}

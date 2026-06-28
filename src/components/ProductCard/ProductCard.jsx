"use client";
import { forwardRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { productUrl } from "@/lib/normalizers";
// Canonical product-card styles live in this shared, global stylesheet.
import "@/components/FeaturedSection/FeaturedSection.css";

const CartIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

/**
 * Global product card — the single source of truth for product cards everywhere
 * (home "Our Best Sellers" / "Latest Launches", wardrobe grids, product-detail
 * recommendations). Use this instead of hand-writing `.product-card` markup so
 * every card stays uniform.
 *
 * Props:
 *  - product: a normalized product (slug, name, price, primaryImage,
 *    shortDescription/description). See lib/normalizers.normalizeProduct.
 *  - index:   position in its list — drives the placeholder-image fallback.
 *  - className / style / ref / … : forwarded to the root `.product-card`
 *    (e.g. wardrobe's GSAP reveal uses ref + style={{opacity:0}}).
 */
const ProductCard = forwardRef(function ProductCard(
  { product, index = 0, className = "", ...rest },
  ref
) {
  const router = useRouter();
  const { addToCart } = useCart();

  if (!product) return null;

  const image =
    product.primaryImage || product.image || `/images/${(index % 4) + 1}.png`;
  const href = productUrl(product);
  const desc = product.shortDescription || product.description;

  return (
    <div
      className={`product-card${className ? ` ${className}` : ""}`}
      ref={ref}
      {...rest}
    >
      <Link href={href} className="product-card-image">
        <img src={image} alt={product.name} loading="lazy" decoding="async" />
      </Link>
      <button
        className="product-card-cart-btn"
        onClick={() => addToCart(product)}
      >
        <span className="cart-btn-circle">
          <CartIcon />
        </span>
        <span className="cart-btn-text">Add to Cart</span>
      </button>
      <div className="product-card-info">
        <Link href={href}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        {desc ? <p className="product-card-desc">{desc}</p> : null}
        <div className="product-card-footer">
          <span className="product-card-price">₹{product.price}</span>
          <button
            className="product-card-buy-btn"
            onClick={() => {
              addToCart(product);
              router.push("/cart");
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;

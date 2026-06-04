"use client";
import Button from "../primitives/Button";
import { useCart } from "@/context/CartContext";

/**
 * AddToCartButton — wires the brand button to CartContext.addToCart.
 * Mirrors the call signature in context/CartContext: addToCart(product, size, qty).
 */
export default function AddToCartButton({
  product,
  size,
  quantity = 1,
  variant = "rect",
  children = "Add to cart",
  className = "",
  onAdded,
  ...props
}) {
  const { addToCart } = useCart();
  const handle = (e) => {
    e?.preventDefault?.();
    addToCart(product, size, quantity);
    onAdded?.(product);
  };
  return (
    <Button variant={variant} className={`ui-add-to-cart ${className}`.trim()} onClick={handle} {...props}>
      {children}
    </Button>
  );
}

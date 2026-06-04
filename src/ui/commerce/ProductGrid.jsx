import ProductCard from "./ProductCard";
import "./ProductGrid.css";

/**
 * ProductGrid — responsive product grid (the repeat(N,1fr) pattern).
 * Either pass `products` (rendered as ProductCards via `getHref`) or arbitrary
 * `children`. `cols`: column count at desktop.
 */
export default function ProductGrid({
  products,
  cols = 4,
  getHref,
  LinkComponent = "a",
  className = "",
  children,
}) {
  return (
    <div className={`ui-product-grid ui-product-grid--${cols} ${className}`.trim()}>
      {children
        ? children
        : (products || []).map((p, i) => (
            <ProductCard
              key={p._id || p.id || i}
              product={p}
              href={getHref ? getHref(p) : undefined}
              LinkComponent={LinkComponent}
            />
          ))}
    </div>
  );
}

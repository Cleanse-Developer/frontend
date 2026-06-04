import PriceDisplay from "./PriceDisplay";
import DiscountBadge from "./DiscountBadge";
import AddToCartButton from "./AddToCartButton";
import "./ProductCard.css";

/**
 * ProductCard — the storefront product tile, distilled from components/Product
 * and the FeaturedSection ".product-card". Image + name + short description +
 * price + add-to-cart. Pass `LinkComponent={Link}` for client navigation.
 *
 * `product` shape (tolerant): { name, price, compareAtPrice, primaryImage|image,
 *   shortDescription|description, discountPercent }
 */
export default function ProductCard({
  product = {},
  href,
  LinkComponent = "a",
  showAddToCart = true,
  className = "",
}) {
  const {
    name,
    price,
    compareAtPrice,
    discountPercent,
    shortDescription,
    description,
  } = product;
  const image = product.primaryImage || product.image;
  const desc = shortDescription || description;
  const ImageTag = href ? LinkComponent : "div";
  const imageProps = href ? { href } : {};

  return (
    <article className={`ui-product-card ${className}`.trim()}>
      <ImageTag className="ui-product-card-media" {...imageProps}>
        {image ? <img src={image} alt={name || "Product"} loading="lazy" /> : null}
        {discountPercent ? (
          <DiscountBadge percent={discountPercent} className="ui-product-card-badge" />
        ) : null}
      </ImageTag>

      <div className="ui-product-card-info">
        {href ? (
          <LinkComponent href={href} className="ui-product-card-name-link">
            <h3 className="ui-product-card-name">{name}</h3>
          </LinkComponent>
        ) : (
          <h3 className="ui-product-card-name">{name}</h3>
        )}
        {desc ? <p className="ui-product-card-desc">{desc}</p> : null}

        <div className="ui-product-card-footer">
          <PriceDisplay price={price} compareAt={compareAtPrice} />
          {showAddToCart ? <AddToCartButton product={product} /> : null}
        </div>
      </div>
    </article>
  );
}

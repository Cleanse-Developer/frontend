"use client";
import "./Product.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { productUrl } from "@/lib/normalizers";

const Product = ({
  product,
  productIndex,
  showAddToCart = true,
  className = "",
  innerRef,
  style,
  imageSrc,
}) => {
  const { addToCart } = useCart();
  const pathname = usePathname();

  const handleImageClick = () => {
    if (pathname.startsWith("/unit/")) {
      window.dispatchEvent(new CustomEvent("scrollToTop"));
    }
  };

  const imgPath = imageSrc || `/products/product_${productIndex}.png`;

  return (
    <div className={`product ${className}`} ref={innerRef} style={style}>
      <Link href={productUrl(product)} className="product-img" onClick={handleImageClick}>
        <img src={imgPath} alt={product.name} />
      </Link>
      <div className="product-info">
        <div className="product-info-wrapper">
          <p>{product.name}</p>
          <p>&#8377;{product.price}</p>
        </div>
        {showAddToCart && (
          <button
            className="add-to-cart-btn"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default Product;

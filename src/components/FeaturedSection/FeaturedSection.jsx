"use client";
import "./FeaturedSection.css";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

const FeaturedSection = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const categories = [
    {
      id: 1,
      name: "SERUMS",
      image: "/tall.jpg",
      size: "tall",
      link: "/wardrobe",
    },
    {
      id: 2,
      name: "FACE CREAM",
      image: "/cream.jpg",
      size: "normal",
      link: "/wardrobe",
    },
    {
      id: 3,
      name: "LOTION",
      image: "/serum.jpg",
      size: "normal",
      link: "/wardrobe",
    },
    {
      id: 4,
      name: "CLEANSE",
      image: "/pink.jpg",
      size: "normal",
      link: "/wardrobe",
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Product 1",
      description: "Description of the product",
      price: "₹400",
      image: "/p1.png",
      link: "/wardrobe",
    },
    {
      id: 2,
      name: "Product 2",
      description: "Description of the product",
      price: "₹400",
      image: "/p2.png",
      link: "/wardrobe",
    },
    {
      id: 3,
      name: "Product 3",
      description: "Description of the product",
      price: "₹400",
      image: "/p3.png",
      link: "/wardrobe",
    },
    {
      id: 4,
      name: "Product 4",
      description: "Description of the product",
      price: "₹400",
      image: "/p4.png",
      link: "/wardrobe",
    },
  ];

  return (
    <>
      {/* Our Featured Products Section */}
      <section className="products-section">
        <h2 className="products-section-title">OUR FEATURED PRODUCTS</h2>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card-image">
                <img src={product.image} alt={product.name} />
                <div className="product-card-overlay">
                  <p className="product-card-overlay-text">{product.description}</p>
                </div>
              </div>
              <div className="product-card-info">
                <h3 className="product-card-name">{product.name}</h3>
                <div className="product-card-footer">
                  <span className="product-card-price">{product.price}</span>
                  <button className="product-card-btn" onClick={() => addToCart({ name: product.name, price: parseInt(product.price.replace(/[^\d]/g, '')) })}>Quick Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="featured-section">
        {/* Section Title */}
        <h2 className="featured-section-title">Why your skin deserves the best?</h2>

        {/* Asymmetric Grid */}
        <div className="featured-grid">
          {/* Left Tall Card */}
          <div className="featured-card featured-card-tall">
            <Link href={categories[0].link}>
              <div className="featured-card-inner">
                <div className="featured-card-image">
                  <img src={categories[0].image} alt={categories[0].name} />
                </div>
                <span className="featured-card-label">{categories[0].name}</span>
              </div>
            </Link>
          </div>

          {/* Right Grid */}
          <div className="featured-grid-right">
            {categories.slice(1, 4).map((category) => (
              <div
                key={category.id}
                className="featured-card"
              >
                <Link href={category.link}>
                  <div className="featured-card-inner">
                    <div className="featured-card-image">
                      <img src={category.image} alt={category.name} />
                    </div>
                    <span className="featured-card-label">{category.name}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedSection;

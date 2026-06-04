"use client";
import { useState } from "react";
import "./ProductGallery.css";

/**
 * ProductGallery — main image + thumbnail strip for the product detail page.
 * `images`: array of urls (or { url, alt }).
 */
export default function ProductGallery({ images = [], alt = "Product", className = "" }) {
  const list = images.map((im) => (typeof im === "string" ? { url: im, alt } : im));
  const [active, setActive] = useState(0);
  if (!list.length) return null;

  return (
    <div className={`ui-gallery ${className}`.trim()}>
      <div className="ui-gallery-main">
        <img src={list[active].url} alt={list[active].alt || alt} />
      </div>
      {list.length > 1 ? (
        <div className="ui-gallery-thumbs">
          {list.map((im, i) => (
            <button
              type="button"
              key={im.url + i}
              className={`ui-gallery-thumb ${i === active ? "is-active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={im.url} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

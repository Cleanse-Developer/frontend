// Storefront product-detail "highlights" section: up to 3 cards (formula story,
// concern, ritual...) shown right below the hero. Authored per product in the
// admin and stored on Product.highlights.
//
// Returns { eyebrow, title, cards } ready to render, or null when the product has
// no usable cards. The page then renders nothing for it (no section, no gap), so
// products without this content are unaffected.
export const MAX_HIGHLIGHT_CARDS = 3;

export function getProductHighlights(product) {
  const highlights = product?.highlights;
  if (!highlights) return null;

  // A card needs at least a title; anything else is optional.
  const cards = (highlights.cards || [])
    .filter((card) => card && typeof card.title === "string" && card.title.trim())
    .slice(0, MAX_HIGHLIGHT_CARDS);
  if (!cards.length) return null;

  return {
    eyebrow: highlights.eyebrow?.trim() || "In focus",
    title: highlights.title?.trim() || `Know your ${product.name}`,
    cards,
  };
}

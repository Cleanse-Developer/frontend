// Storefront product-detail "listing content" — the hero title, marketing blurb,
// and the tag / helps / targets chip rows. Authored per product in the admin and
// stored on Product.listingContent (previously this was hardcoded here per
// product; it now lives in the DB and is fetched with the product).
//
// Returns the content object, or null when a product has none — the product page
// then falls back to the product's own name / description (see the
// `listingContent?.title || product.name` usage there).
export function getProductListingContent(product) {
  const lc = product?.listingContent;
  if (!lc) return null;

  const hasContent =
    lc.title ||
    lc.description ||
    lc.tags?.length ||
    lc.helps?.length ||
    lc.targets?.length;

  return hasContent ? lc : null;
}

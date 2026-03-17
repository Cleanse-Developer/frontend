/**
 * Data shape transformers: backend → frontend
 */

/**
 * Build product detail URL. Appends ?variant=sku for products with sizes.
 */
export function productUrl(product) {
  const base = `/unit/${product.slug}`;
  if (product.sizes && product.sizes.length > 0) {
    const firstSku = product.sizes[0].sku || product.sizes[0].label;
    return `${base}?variant=${encodeURIComponent(firstSku)}`;
  }
  return base;
}

export function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    _id: p._id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    tag: p.tag,
    color: p.color,
    description: p.description,
    shortDescription: p.shortDescription,
    ingredients: p.ingredients,
    howToUse: p.howToUse,
    values: p.values,
    shippingInfo: p.shippingInfo,
    policies: p.policies,
    sizes: p.sizes || [],
    sizeLabels: (p.sizes || []).map((s) => s.label),
    images: p.images || [],
    primaryImage: (p.images?.find((img) => img.isPrimary) || p.images?.[0])?.url || "/images/placeholder.jpg",
    averageRating: p.averageRating || 0,
    reviewCount: p.reviewCount || 0,
    totalStock: p.totalStock || 0,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    category: p.category,
    seo: p.seo,
  };
}

export function normalizeBlog(b) {
  if (!b) return null;
  return {
    ...b,
    featured: b.isFeatured,
    date: b.publishedAt
      ? new Date(b.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "",
    author: b.author
      ? {
          ...b.author,
          name: b.author.name || "Cleanse Ayurveda",
          bio: b.author.bio || "",
        }
      : { name: "Cleanse Ayurveda", bio: "" },
  };
}

export function normalizeOrder(o) {
  if (!o) return null;
  return {
    ...o,
    id: o.orderId,
    date: new Date(o.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    total: o.pricing?.total,
    status:
      o.status?.charAt(0).toUpperCase() + o.status?.slice(1).toLowerCase(),
    items: (o.items || []).map((item) => ({
      ...item,
      qty: item.quantity,
    })),
  };
}

export function normalizeCoupon(c) {
  if (!c) return null;
  return {
    ...c,
    validTillFormatted: c.validTill
      ? new Date(c.validTill).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "",
  };
}

export function normalizeAddress(a) {
  // Backend field names already match checkout form
  return a ? { ...a } : null;
}

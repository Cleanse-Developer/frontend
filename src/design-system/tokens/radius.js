/**
 * Border-radius tokens — the recurring corner radii across the codebase.
 * (No `--radius-*` variables exist in globals.css; these standardise the
 * observed raw values for new components.)
 */
export const radius = {
  sm: "0.5rem", //   8px  — buttons, inputs, small cards
  md: "0.75rem", //  12px — product image corners, CTA cards, hero button, locale pill
  lg: "1rem", //     16px — cards, modals, nav items
  xl: "1.25rem", //  20px — hero bottom corners
  "2xl": "1.5rem", // 24px — featured/bento cards
  "3xl": "2rem", //  32px — shop-by-product hero image
  card: "1.75rem", // 28px — ritual cards
  pill: "100px", //  large pill (badges)
  round: "9999px", // fully rounded (CTA pills)
};

export default radius;

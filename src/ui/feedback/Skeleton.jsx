import "./Skeleton.css";

/**
 * Skeleton — shimmer placeholder for loading content.
 * `variant`: "text" | "rect" | "circle". Pass width/height (number → px, or string).
 */
export default function Skeleton({ variant = "rect", width, height, className = "", style, ...props }) {
  const dim = (v) => (typeof v === "number" ? `${v}px` : v);
  const mergedStyle = {
    ...(width ? { width: dim(width) } : null),
    ...(height ? { height: dim(height) } : null),
    ...style,
  };
  return (
    <span
      className={`ui-skeleton ui-skeleton--${variant} ${className}`.trim()}
      style={mergedStyle}
      aria-hidden="true"
      {...props}
    />
  );
}

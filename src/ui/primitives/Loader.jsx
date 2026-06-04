import "./Loader.css";

/**
 * Loader — brand spinner for inline/async loading states. (The full-screen
 * intro animation lives in components/Preloader; this is the lightweight,
 * reusable spinner.)
 */
export default function Loader({ size = 28, label = "Loading", className = "", ...props }) {
  const style = { width: size, height: size, ...(props.style || {}) };
  return (
    <span
      className={`ui-loader ${className}`.trim()}
      role="status"
      aria-label={label}
      style={style}
      {...props}
    >
      <span className="ui-loader-spinner" />
    </span>
  );
}

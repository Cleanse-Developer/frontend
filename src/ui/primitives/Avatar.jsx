import "./Avatar.css";

/**
 * Avatar — round image/initial, extracted from .testimonial-avatar.
 * Falls back to initials when no `src` is given.
 */
export default function Avatar({ src, alt = "", name = "", size = 48, className = "", ...props }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const style = { width: size, height: size, ...(props.style || {}) };
  return (
    <span className={`ui-avatar ${className}`.trim()} style={style}>
      {src ? (
        <img className="ui-avatar-img" src={src} alt={alt || name} />
      ) : (
        <span className="ui-avatar-fallback">{initials || "?"}</span>
      )}
    </span>
  );
}

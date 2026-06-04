import "./Divider.css";

/** Divider — hairline separator. `orientation`: "horizontal" | "vertical". */
export default function Divider({ orientation = "horizontal", className = "", ...props }) {
  return (
    <hr
      className={`ui-divider ui-divider--${orientation} ${className}`.trim()}
      aria-orientation={orientation}
      {...props}
    />
  );
}

import "./Logo.css";

/*
  Brand wordmark. The registered-trademark (®) mark is baked into the SVG
  itself (top-right of the "CLEANSE" glyph) so it scales and recolors
  (via CSS filters) together with the logo at every placement.
*/
const Logo = ({
  src = "/cleanse-logo.svg",
  alt = "Cleanse",
  className = "",
  imgClassName = "",
  ...imgProps
}) => (
  <span className={`logo-mark ${className}`}>
    <img src={src} alt={alt} className={imgClassName} {...imgProps} />
  </span>
);

export default Logo;

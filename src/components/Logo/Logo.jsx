import "./Logo.css";

/*
  Brand wordmark with a registered-trademark (®) mark anchored to the
  top-right of the actual "CLEANSE" glyph (the PNG has ~6% transparent
  padding on the right / ~18% on top, accounted for below). The ® scales
  with the logo via container units and inherits color from --logo-r-color.
*/
const Logo = ({
  src = "/logo.png",
  alt = "Cleanse",
  className = "",
  imgClassName = "",
  ...imgProps
}) => (
  <span className={`logo-mark ${className}`}>
    <img src={src} alt={alt} className={imgClassName} {...imgProps} />
    <span className="logo-mark-r" aria-hidden="true">&reg;</span>
  </span>
);

export default Logo;

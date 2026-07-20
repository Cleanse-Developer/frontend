import "./Logo.css";

/*
  Brand wordmark shared across header, footer, and account screens.
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
  </span>
);

export default Logo;

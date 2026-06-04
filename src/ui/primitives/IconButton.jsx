import "./IconButton.css";

/**
 * IconButton — square, transparent icon trigger, extracted from
 * .menu-action-btn (search / profile / cart header icons).
 * Pass an svg/icon as children and an `aria-label`.
 */
export default function IconButton({ as: Tag = "button", className = "", children, ...props }) {
  return (
    <Tag className={`ui-icon-btn ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

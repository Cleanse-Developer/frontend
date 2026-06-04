/**
 * Container — centered content column at the standard --page-max width with
 * --gutter padding. Composes the design-system `.ds-container` utility
 * (src/design-system/styles/layout.css).
 */
export default function Container({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag className={`ds-container ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

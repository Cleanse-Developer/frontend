/**
 * Section — full-bleed band with the standard --section-py vertical rhythm.
 * When `contained` (default) the children are wrapped in a centered Container.
 * Composes `.ds-section` / `.ds-container`.
 */
import Container from "./Container";

export default function Section({
  as: Tag = "section",
  contained = true,
  className = "",
  containerClassName = "",
  children,
  ...props
}) {
  return (
    <Tag className={`ds-section ${className}`.trim()} {...props}>
      {contained ? (
        <Container className={containerClassName}>{children}</Container>
      ) : (
        children
      )}
    </Tag>
  );
}

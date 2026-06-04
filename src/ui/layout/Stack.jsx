/**
 * Stack — flex column/row with a gap. Composes `.ds-stack`.
 * `direction`: "column" (default) | "row". `align`/`justify` set inline.
 */
export default function Stack({
  direction = "column",
  gap,
  align,
  justify,
  className = "",
  style,
  children,
  ...props
}) {
  const cls = `ds-stack ${direction === "row" ? "ds-stack--row" : ""} ${className}`.trim();
  const mergedStyle = {
    ...(gap ? { gap } : null),
    ...(align ? { alignItems: align } : null),
    ...(justify ? { justifyContent: justify } : null),
    ...style,
  };
  return (
    <div className={cls} style={mergedStyle} {...props}>
      {children}
    </div>
  );
}

/**
 * Grid — equal-column grid (the recurring repeat(N, 1fr) pattern).
 * `cols`: 2 | 3 | 4 (responsive collapse handled by `.ds-grid--*`).
 * Pass `gap` to override the default 1.5rem.
 */
export default function Grid({ cols = 3, gap, className = "", style, children, ...props }) {
  const mergedStyle = gap ? { gap, ...style } : style;
  return (
    <div className={`ds-grid ds-grid--${cols} ${className}`.trim()} style={mergedStyle} {...props}>
      {children}
    </div>
  );
}

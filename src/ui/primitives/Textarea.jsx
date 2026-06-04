import "./Textarea.css";

/** Textarea — multiline field matching Input's styling. */
export default function Textarea({ className = "", invalid = false, rows = 4, ...props }) {
  const cls = `ui-textarea ${invalid ? "ui-textarea--invalid" : ""} ${className}`.trim();
  return <textarea className={cls} rows={rows} {...props} />;
}

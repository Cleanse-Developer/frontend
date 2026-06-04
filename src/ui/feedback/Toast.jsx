import "./Toast.css";

/**
 * Toast — presentational toast bubble extracted from context/ToastContext.
 * The live toast SYSTEM (queue + auto-dismiss) stays in ToastProvider/useToast;
 * this is the reusable visual, e.g. for a custom viewport.
 * `tone`: "success" | "error" | "info".
 */
export default function Toast({ tone = "info", children, onDismiss, className = "" }) {
  return (
    <div className={`ui-toast ui-toast--${tone} ${className}`.trim()} role="status">
      <span className="ui-toast-msg">{children}</span>
      {onDismiss ? (
        <button type="button" className="ui-toast-close" onClick={onDismiss} aria-label="Dismiss">×</button>
      ) : null}
    </div>
  );
}

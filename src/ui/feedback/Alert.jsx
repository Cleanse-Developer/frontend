import "./Alert.css";

/**
 * Alert — inline message box. `tone`: "info" | "success" | "warning" | "error".
 */
export default function Alert({ tone = "info", title, children, className = "", ...props }) {
  return (
    <div className={`ui-alert ui-alert--${tone} ${className}`.trim()} role="alert" {...props}>
      {title ? <p className="ui-alert-title">{title}</p> : null}
      {children ? <div className="ui-alert-body">{children}</div> : null}
    </div>
  );
}

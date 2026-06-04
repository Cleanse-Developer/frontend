import "./EmptyState.css";

/**
 * EmptyState — centered icon + title + message + optional action, for empty
 * cart / wishlist / orders / search-results screens.
 */
export default function EmptyState({ icon, title, message, action, className = "" }) {
  return (
    <div className={`ui-empty ${className}`.trim()}>
      {icon ? <div className="ui-empty-icon">{icon}</div> : null}
      {title ? <h3 className="ui-empty-title">{title}</h3> : null}
      {message ? <p className="ui-empty-msg">{message}</p> : null}
      {action ? <div className="ui-empty-action">{action}</div> : null}
    </div>
  );
}

import "./PageHeader.css";

/**
 * PageHeader — the breadcrumb + big title hero header used by /wardrobe and
 * /blog ("THE JOURNAL"). Title uses the brand heading font, uppercase.
 *
 *   <PageHeader breadcrumb={<>HOME / <span>JOURNAL</span></>} title="The Journal" subtitle="…" />
 */
export default function PageHeader({ breadcrumb, eyebrow, title, subtitle, className = "", children }) {
  return (
    <div className={`ui-page-header ${className}`.trim()}>
      {breadcrumb ? <div className="ui-page-header-crumb">{breadcrumb}</div> : null}
      {eyebrow ? <span className="ui-page-header-eyebrow">{eyebrow}</span> : null}
      {title ? <h1 className="ui-page-header-title">{title}</h1> : null}
      {subtitle ? <p className="ui-page-header-subtitle">{subtitle}</p> : null}
      {children}
    </div>
  );
}

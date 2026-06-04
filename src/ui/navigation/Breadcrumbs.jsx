import "./Breadcrumbs.css";

/**
 * Breadcrumbs — the "HOME / SHOP / ALL" trail used on /wardrobe and /blog.
 * `items`: [{ label, href }]. The last item renders as the current page.
 * `LinkComponent` lets you pass next/link; defaults to <a>.
 */
export default function Breadcrumbs({ items = [], separator = "/", LinkComponent = "a", className = "" }) {
  return (
    <nav className={`ui-breadcrumbs ${className}`.trim()} aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span className="ui-breadcrumbs-item" key={`${item.label}-${i}`}>
            {item.href && !isLast ? (
              <LinkComponent href={item.href} className="ui-breadcrumbs-link">
                {item.label}
              </LinkComponent>
            ) : (
              <span className="ui-breadcrumbs-current" aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            )}
            {!isLast ? <span className="ui-breadcrumbs-sep" aria-hidden="true">{separator}</span> : null}
          </span>
        );
      })}
    </nav>
  );
}

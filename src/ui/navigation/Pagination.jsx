"use client";
import "./Pagination.css";

/**
 * Pagination — page number controls for product/blog/order lists.
 * Controlled: pass `page`, `totalPages`, and `onPageChange(nextPage)`.
 */
export default function Pagination({ page = 1, totalPages = 1, onPageChange, className = "" }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange?.(p);
  };

  return (
    <nav className={`ui-pagination ${className}`.trim()} aria-label="Pagination">
      <button
        type="button"
        className="ui-pagination-arrow"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          type="button"
          key={p}
          className={`ui-pagination-page ${p === page ? "is-active" : ""}`}
          onClick={() => go(p)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className="ui-pagination-arrow"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}

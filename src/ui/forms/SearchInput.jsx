"use client";
import { useState } from "react";
import "./SearchInput.css";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

/**
 * SearchInput — search field with leading icon + submit, modelled on the Menu
 * search bar. Controlled (`value`/`onChange`) or uncontrolled; calls
 * `onSubmit(query)` on Enter / submit.
 */
export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search products…",
  className = "",
  autoFocus = false,
}) {
  const [internal, setInternal] = useState("");
  const isControlled = value !== undefined;
  const query = isControlled ? value : internal;

  const handleChange = (e) => {
    if (!isControlled) setInternal(e.target.value);
    onChange?.(e);
  };
  const submit = (e) => {
    e.preventDefault();
    const q = (query || "").trim();
    if (q) onSubmit?.(q);
  };

  return (
    <form className={`ui-search ${className}`.trim()} onSubmit={submit} role="search">
      <span className="ui-search-icon" aria-hidden="true"><SearchIcon /></span>
      <input
        className="ui-search-input"
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Search"
      />
    </form>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { blogApi } from "@/lib/endpoints";
import { normalizeBlog } from "@/lib/normalizers";
import "./blogpost.css";

// Interactive blog article view. The server component (page.js) fetches the post
// and passes it in as `initialBlog` so the first HTML already contains the real
// title/image/body (crawlable + no loading flash). This component only re-fetches
// as a fallback when the server didn't supply data and it wasn't a confirmed 404.

/* A summary that just repeats the opening paragraph makes the article read as
   though it starts twice. The summary is admin-authored, so we can't rewrite it
   here — but we can decline to print the same text twice. Compared on collapsed
   whitespace/punctuation, and by prefix, since a summary is often the first
   paragraph truncated. */
const flatten = (s = "") =>
  s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();

function summaryRepeatsOpening(summary, content) {
  const s = flatten(summary);
  const first = flatten(content?.[0]);
  if (!s || !first) return false;
  const [shorter, longer] = s.length <= first.length ? [s, first] : [first, s];
  // Ignore a trivially short summary — too little overlap to call it a repeat.
  return shorter.length >= 40 && longer.startsWith(shorter.slice(0, 120));
}
export default function BlogPostClient({
  slug,
  initialBlog = null,
  initialRelated = [],
  initialNotFound = false,
}) {
  const [copied, setCopied] = useState(false);
  const [blog, setBlog] = useState(initialBlog);
  const [relatedPosts, setRelatedPosts] = useState(initialRelated);
  const [loading, setLoading] = useState(!initialBlog && !initialNotFound);

  // Sync to whatever the server provided for the current slug (this covers
  // client-side navigation between posts, where the server sends fresh props).
  useEffect(() => {
    if (initialBlog) {
      setBlog(initialBlog);
      setRelatedPosts(initialRelated);
      setLoading(false);
      return;
    }
    if (initialNotFound) {
      setBlog(null);
      setLoading(false);
      return;
    }
    // Fallback: server returned nothing (transient) and it's not a known 404.
    setLoading(true);
    blogApi
      .getBySlug(slug)
      .then((data) => {
        setBlog(normalizeBlog(data.blog || data));
        setRelatedPosts((data.relatedBlogs || []).map(normalizeBlog));
      })
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug, initialBlog, initialRelated, initialNotFound]);

  if (loading) {
    return (
      <div className="blogpost-not-found">
        <div className="blogpost-not-found-inner">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // 404 state
  if (!blog) {
    return (
      <div className="blogpost-not-found">
        <div className="blogpost-not-found-inner">
          <span className="blogpost-not-found-tag">404</span>
          <h2 className="blogpost-not-found-title">Article Not Found</h2>
          <p className="blogpost-not-found-desc">
            The article you are looking for does not exist or has been moved.
          </p>
          <Link href="/blog" className="blogpost-not-found-link">
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Both share targets take the post title + canonical URL as pre-filled text.
  // noopener/noreferrer: without it the opened tab gets a handle on ours via
  // window.opener and could navigate it somewhere else.
  const openShare = (url) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(blog.title);
    const url = encodeURIComponent(window.location.href);
    openShare(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
  };

  const handleShareWhatsApp = () => {
    // WhatsApp takes one `text` param, so the title and URL go in together.
    const text = encodeURIComponent(`${blog.title} ${window.location.href}`);
    openShare(`https://wa.me/?text=${text}`);
  };

  return (
    <div className="blogpost-page">
      {/* Hero Section */}
      <section className="blogpost-hero">
        <div className="blogpost-hero-bg">
          <img src={blog.image} alt={blog.title} />
        </div>
        <div className="blogpost-hero-overlay" />
        <div className="blogpost-hero-content">
          <div className="blogpost-breadcrumb">
            <Link href="/">HOME</Link>
            <span className="blogpost-breadcrumb-sep">/</span>
            <Link href="/blog">JOURNAL</Link>
            <span className="blogpost-breadcrumb-sep">/</span>
            <span className="blogpost-breadcrumb-current">{blog.title}</span>
          </div>
          <div className="blogpost-hero-category">{blog.category}</div>
          <h1 className="blogpost-hero-title">{blog.title}</h1>
          <div className="blogpost-hero-meta">
            <span className="blogpost-hero-readtime">{blog.readTime}</span>
            <span className="blogpost-hero-divider" />
            <span className="blogpost-hero-author">{blog.author.name}</span>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <section className="blogpost-body">
        <article className="blogpost-article">
          {/* Admin-authored summary. Rendered only when present — no fallback,
              never faked. Distinct from `excerpt` (the list-card teaser).
              Suppressed when it merely repeats the opening paragraph. */}
          {blog.summary && !summaryRepeatsOpening(blog.summary, blog.content) && (
            <p className="blogpost-summary">{blog.summary}</p>
          )}
          {blog.content.map((paragraph, index) => (
            <p
              key={index}
              className={`blogpost-paragraph ${index === 0 ? "blogpost-paragraph-first" : ""}`}
            >
              {paragraph}
            </p>
          ))}

          {/* Share Buttons */}
          <div className="blogpost-share">
            <span className="blogpost-share-label">Share this article</span>
            <div className="blogpost-share-buttons">
              <button
                className="blogpost-share-btn"
                aria-label="Share on Twitter"
                onClick={handleShareTwitter}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Twitter</span>
              </button>
              <button
                className="blogpost-share-btn"
                aria-label="Share on WhatsApp"
                onClick={handleShareWhatsApp}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp</span>
              </button>
              <button
                className="blogpost-share-btn"
                aria-label="Copy link"
                onClick={handleCopyLink}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* Author Card */}
          <div className="blogpost-author-card">
            <div className="blogpost-author-avatar">
              <span>{blog.author.name.charAt(0)}</span>
            </div>
            <div className="blogpost-author-info">
              <span className="blogpost-author-label">Written by</span>
              <h4 className="blogpost-author-name">{blog.author.name}</h4>
              <p className="blogpost-author-bio">{blog.author.bio}</p>
            </div>
          </div>
        </article>
      </section>

      {/* Related Posts */}
      <section className="blogpost-related">
        <div className="blogpost-related-inner">
          <div className="blogpost-related-header">
            <span className="blogpost-related-tag">Continue Reading</span>
            <h3 className="blogpost-related-title">More from the Journal</h3>
          </div>
          <div className="blogpost-related-grid">
            {relatedPosts.map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                key={post._id || post.slug}
                className="blogpost-related-card"
              >
                <div className="blogpost-related-card-img">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="blogpost-related-card-body">
                  <div className="blogpost-related-card-meta">
                    <span className="blogpost-related-card-cat">{post.category}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="blogpost-related-card-title">{post.title}</h3>
                  <div className="blogpost-related-card-footer">
                    <div className="blogpost-related-card-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

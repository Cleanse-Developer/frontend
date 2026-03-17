"use client";
import "./blog.css";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { blogApi, newsletterApi } from "@/lib/endpoints";
import { normalizeBlog } from "@/lib/normalizers";

gsap.registerPlugin(ScrollTrigger);

const categories = ["All", "Hair Care", "Skin Care", "Wellness", "Rituals", "Ingredients"];

export default function BlogPage() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const cardsRef = useRef([]);
  const featuredRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nlEmail, setNlEmail] = useState("");
  const [nlSubmitted, setNlSubmitted] = useState(false);
  const [nlSubmitting, setNlSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!nlEmail || nlSubmitting) return;
    setNlSubmitting(true);
    try {
      await newsletterApi.subscribe(nlEmail, "blog");
    } catch { /* silent */ }
    setNlSubmitted(true);
    setNlSubmitting(false);
  };

  useEffect(() => {
    blogApi.getAll({ limit: 50 }).then((data) => {
      const normalized = (data.blogs || []).map(normalizeBlog);
      setBlogs(normalized);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredBlogs = activeCategory === "All"
    ? blogs
    : blogs.filter((b) => b.category === activeCategory);

  const featuredBlog = blogs.find((b) => b.featured);
  const gridBlogs = filteredBlogs.filter((b) => !b.featured || activeCategory !== "All");

  useGSAP(() => {
    // Hero parallax
    if (heroRef.current) {
      const heroImg = heroRef.current.querySelector(".blog-hero-bg img");
      if (heroImg) {
        gsap.fromTo(heroImg,
          { scale: 1.15 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
          }
        );
      }
    }

    // Featured card reveal
    if (featuredRef.current) {
      gsap.fromTo(featuredRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuredRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    // Grid cards stagger
    const cards = cardsRef.current.filter(Boolean);
    if (cards.length) {
      gsap.fromTo(cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    // Parallax on card images
    cardsRef.current.forEach((card) => {
      if (!card) return;
      const img = card.querySelector(".blog-grid-card-img img");
      if (!img) return;
      gsap.fromTo(img,
        { yPercent: -8, force3D: true },
        {
          yPercent: 8,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.3,
          },
        }
      );
    });
  }, { dependencies: [filteredBlogs, activeCategory] });

  return (
    <div className="blog-page">
      {/* Hero */}
      <section className="blog-hero" ref={heroRef}>
        <div className="blog-hero-bg">
          <img src="/images/b2.png" alt="" />
        </div>
        <div className="blog-hero-overlay" />
        <div className="blog-hero-content">
          <div className="blog-breadcrumb">
            <Link href="/">HOME</Link> / <span>JOURNAL</span>
          </div>
          <h1 className="blog-hero-title">THE<br />JOURNAL</h1>
          <p className="blog-hero-subtitle">
            Ancient wisdom, modern stories — explore the art of Ayurvedic living.
          </p>
        </div>
        <div className="blog-hero-scroll-indicator">
          <span>Scroll</span>
          <div className="blog-scroll-line" />
        </div>
      </section>

      {/* Featured Article - Full width cinematic card */}
      {activeCategory === "All" && featuredBlog && (
        <section className="blog-featured" ref={featuredRef} style={{ opacity: 0 }}>
          <Link href={`/blog/${featuredBlog.slug}`} className="blog-featured-card">
            <div className="blog-featured-img">
              <img src={featuredBlog.image} alt={featuredBlog.title} />
            </div>
            <div className="blog-featured-overlay" />
            <div className="blog-featured-content">
              <div className="blog-featured-badge">Featured Story</div>
              <div className="blog-featured-meta">
                <span className="blog-featured-cat">{featuredBlog.category}</span>
                <span className="blog-featured-divider" />
                <span className="blog-featured-date">{featuredBlog.date}</span>
                <span className="blog-featured-divider" />
                <span className="blog-featured-read">{featuredBlog.readTime}</span>
              </div>
              <h2 className="blog-featured-title">{featuredBlog.title}</h2>
              <p className="blog-featured-excerpt">{featuredBlog.excerpt}</p>
              <div className="blog-featured-cta">
                <span>Read Full Story</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="blog-featured-number">01</div>
          </Link>
        </section>
      )}

      {/* Category Filter */}
      <section className="blog-filter">
        <div className="blog-filter-inner">
          <div className="blog-filter-label">Filter</div>
          <div className="blog-filter-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`blog-filter-pill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid - Bento/Masonry style */}
      <section className="blog-grid-section" ref={gridRef}>
        <div className="blog-grid-container">
          {gridBlogs.map((blog, index) => (
            <Link
              href={`/blog/${blog.slug}`}
              key={blog._id || blog.slug}
              className={`blog-grid-card ${index === 0 ? "blog-grid-card-wide" : ""} ${index === 3 ? "blog-grid-card-tall" : ""}`}
              ref={(el) => (cardsRef.current[index] = el)}
              style={{ opacity: 0 }}
            >
              <div className="blog-grid-card-img">
                <img src={blog.image} alt={blog.title} />
              </div>
              <div className="blog-grid-card-body">
                <div className="blog-grid-card-meta">
                  <span className="blog-grid-card-cat">{blog.category}</span>
                  <span>{blog.readTime}</span>
                </div>
                <h3 className="blog-grid-card-title">{blog.title}</h3>
                <p className="blog-grid-card-excerpt">{blog.excerpt}</p>
                <div className="blog-grid-card-footer">
                  <span className="blog-grid-card-date">{blog.date}</span>
                  <div className="blog-grid-card-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="blog-newsletter">
        <div className="blog-newsletter-inner">
          <div className="blog-newsletter-content">
            <span className="blog-newsletter-tag">STAY ROOTED</span>
            <h2 className="blog-newsletter-title">Stories Delivered<br />To Your Inbox</h2>
            <p className="blog-newsletter-desc">
              Get weekly Ayurvedic insights, rituals, and exclusive content — straight from our journal.
            </p>
            {nlSubmitted ? (
              <p className="blog-newsletter-desc" style={{ color: "#4F2C22", fontWeight: 500 }}>Thank you for subscribing!</p>
            ) : (
              <form className="blog-newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input type="email" placeholder="Enter your email" required value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} />
                <button type="submit" disabled={nlSubmitting}>{nlSubmitting ? "..." : "Subscribe"}</button>
              </form>
            )}
          </div>
          <div className="blog-newsletter-visual">
            <img src="/images/cta.png" alt="Ayurvedic rituals" />
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";
import "./BlogSection.css";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const BlogSection = () => {
  const sectionRef = useRef(null);
  const imagesRef = useRef([]);

  useGSAP(() => {
    imagesRef.current.forEach((img) => {
      if (!img) return;

      gsap.fromTo(img,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest('.blog-card'),
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          }
        }
      );
    });
  }, { scope: sectionRef });

  const blogs = [
    {
      id: 1,
      title: "The Ancient Wisdom of Ayurvedic Hair Rituals",
      category: "Hair Care",
      date: "Jan 28, 2025",
      image: "/tall.jpg",
      excerpt: "Discover centuries-old techniques for naturally lustrous hair.",
      link: "/blog/ayurvedic-hair-rituals",
    },
    {
      id: 2,
      title: "Understanding Your Dosha for Better Skin",
      category: "Skin Care",
      date: "Jan 22, 2025",
      image: "/cream.jpg",
      excerpt: "Learn how your unique constitution affects your skincare needs.",
      link: "/blog/dosha-skin-care",
    },
    {
      id: 3,
      title: "Morning Rituals for Radiant Complexion",
      category: "Wellness",
      date: "Jan 15, 2025",
      image: "/pink.jpg",
      excerpt: "Simple daily practices that transform your skin from within.",
      link: "/blog/morning-rituals",
    },
  ];

  return (
    <section className="blog-section" ref={sectionRef}>
      <div className="blog-section-container">
        <div className="blog-section-header">
          <div className="blog-header-left">
            <span className="blog-section-label">Journal</span>
            <h2 className="blog-section-title">Stories & Insights</h2>
          </div>
          <div className="blog-header-right">
            <Link href="/blog" className="blog-view-all">
              <span>View All Articles</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="blog-grid">
          {blogs.map((blog, index) => (
            <Link
              href={blog.link}
              key={blog.id}
              className={`blog-card ${index === 0 ? 'blog-card-featured' : 'blog-card-green'}`}
            >
              <div className="blog-card-image-wrapper">
                <div
                  className="blog-card-image"
                  ref={el => imagesRef.current[index] = el}
                >
                  <img src={blog.image} alt={blog.title} />
                </div>
                <div className="blog-card-overlay">
                  <span className="blog-card-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span className="blog-card-category">{blog.category}</span>
                  <span className="blog-card-divider">—</span>
                  <span className="blog-card-date">{blog.date}</span>
                </div>
                <h3 className="blog-card-title">{blog.title}</h3>
                <p className="blog-card-excerpt">{blog.excerpt}</p>
                <div className="blog-card-read-more">
                  <span>Read Article</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;

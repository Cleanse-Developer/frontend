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
        { yPercent: -10, force3D: true },
        {
          yPercent: 10,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: img.closest('.blog-card'),
            start: "top bottom",
            end: "bottom top",
            scrub: 0.3,
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
      image: "/images/b1.png",
      excerpt: "Discover centuries-old techniques for naturally lustrous hair.",
      link: "/blog/ayurvedic-hair-rituals",
    },
    {
      id: 2,
      title: "Understanding Your Dosha for Better Skin",
      category: "Skin Care",
      date: "Jan 22, 2025",
      image: "/images/b2.png",
      excerpt: "Learn how your unique constitution affects your skincare needs.",
      link: "/blog/dosha-skin-care",
    },
    {
      id: 3,
      title: "Morning Rituals for Radiant Complexion",
      category: "Wellness",
      date: "Jan 15, 2025",
      image: "/images/b3.png",
      excerpt: "Simple daily practices that transform your skin from within.",
      link: "/blog/morning-rituals",
    },
  ];

  return (
    <section className="blog-section" ref={sectionRef}>
      <div className="blog-section-container">
        <div className="blog-section-header">
          <h2 className="blog-section-title">STORIES AND INSIGHTS</h2>
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
                  <img src={blog.image} alt={blog.title} loading="lazy" />
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

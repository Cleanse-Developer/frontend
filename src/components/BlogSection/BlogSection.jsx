"use client";
import "./BlogSection.css";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { blogApi } from "@/lib/endpoints";
import { normalizeBlog } from "@/lib/normalizers";

gsap.registerPlugin(ScrollTrigger);

const BlogSection = () => {
  const sectionRef = useRef(null);
  const imagesRef = useRef([]);
  const [allBlogs, setAllBlogs] = useState([]);

  useEffect(() => {
    blogApi.getAll({ limit: 3 }).then((data) => {
      setAllBlogs((data.blogs || []).map(normalizeBlog));
    }).catch(() => {}).finally(() => {
      // Height changes after async load — recompute scroll positions.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }, []);

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

  const blogs = allBlogs;

  return (
    <section className="blog-section" ref={sectionRef}>
      <div className="blog-section-container">
        <div className="blog-section-header">
          <h2 className="blog-section-title">STORIES AND INSIGHTS</h2>
        </div>

        <div className="blog-grid">
          {blogs.map((blog, index) => (
            <Link
              href={`/blog/${blog.slug}`}
              key={blog._id || blog.slug}
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
                  <span className="blog-card-divider">·</span>
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

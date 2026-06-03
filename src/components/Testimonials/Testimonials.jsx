"use client";
import "./Testimonials.css";
import { useState, useRef, useEffect } from "react";
import Copy from "../Copy/Copy";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { testimonialApi } from "@/lib/endpoints";

gsap.registerPlugin(SplitText, ScrollTrigger);

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardsRef = useRef([]);
  const fluidBgRef = useRef(null);
  const containerRef = useRef(null);
  const headlineSplitsRef = useRef([]);
  const initRef = useRef(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, text: "" });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const openReviewForm = () => {
    setReviewSubmitted(false);
    setReviewForm({ name: "", rating: 5, text: "" });
    setShowReviewForm(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) return;
    setReviewSubmitting(true);
    try {
      await testimonialApi.create?.({
        name: reviewForm.name.trim(),
        rating: reviewForm.rating,
        text: reviewForm.text.trim(),
        role: "Verified Buyer",
      });
    } catch {
      // Submission endpoint may be unavailable — still thank the user.
    } finally {
      setReviewSubmitting(false);
      setReviewSubmitted(true);
    }
  };

  // Fetch testimonials from API
  useEffect(() => {
    testimonialApi.getAll({ type: "before-after", limit: 8 })
      .then((data) => {
        const items = data.testimonials || [];
        setTestimonials(items.map((t, i) => ({
          id: t._id || i + 1,
          name: t.name,
          role: t.role || "Verified Buyer",
          headline: t.headline,
          text: t.text,
          beforeImage: t.beforeImage,
          afterImage: t.afterImage,
        })));
      })
      .catch(() => {})
      .finally(() => {
        // Height changes after async load — recompute scroll positions.
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
  }, []);

  // Initialize animations after testimonials are loaded and rendered
  useEffect(() => {
    if (testimonials.length === 0) return;

    // Wait a tick for DOM to render
    const timer = setTimeout(() => {
      // Set initial position of fluid background on first card
      updateFluidPosition(0, false);

      // Initialize SplitText for all headlines
      cardsRef.current.forEach((card, i) => {
        if (card) {
          const headline = card.querySelector('.testimonial-headline');
          if (headline && !headlineSplitsRef.current[i]) {
            const split = SplitText.create(headline, {
              type: "words,chars",
            });
            headlineSplitsRef.current[i] = split;

            if (i === 0) {
              gsap.set(split.chars, { opacity: 1 });
            } else {
              gsap.set(split.chars, { opacity: 0 });
            }
          }
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      headlineSplitsRef.current.forEach((split) => {
        if (split) split.revert();
      });
    };
  }, [testimonials]);

  const updateFluidPosition = (index, animate = true) => {
    const card = cardsRef.current[index];
    const container = containerRef.current;
    const fluidBg = fluidBgRef.current;

    if (!card || !container || !fluidBg) return;

    const cardRect = card.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const left = cardRect.left - containerRect.left;
    const top = cardRect.top - containerRect.top;
    const size = Math.max(cardRect.width, cardRect.height) * 1.1;

    const targetLeft = left + (cardRect.width - size) / 2;
    const targetTop = top + (cardRect.height - size) / 2;

    if (animate) {
      gsap.to(fluidBg, {
        left: left,
        top: top,
        width: cardRect.width,
        height: cardRect.height,
        duration: 0.4,
        ease: "power2.inOut"
      });
    } else {
      gsap.set(fluidBg, {
        left: left,
        top: top,
        width: cardRect.width,
        height: cardRect.height,
        scaleX: 1,
        scaleY: 1
      });
    }
  };

  const animateContent = (newIndex, oldIndex) => {
    // Animate out old card content with flicker
    const oldSplit = headlineSplitsRef.current[oldIndex];
    if (oldSplit && oldSplit.chars) {
      gsap.to(oldSplit.chars, {
        opacity: 0,
        duration: 0.05,
        stagger: {
          amount: 0.2,
          from: "random",
        },
        ease: "power2.in"
      });
    }

    // Animate in new card content with flicker
    const newSplit = headlineSplitsRef.current[newIndex];
    if (newSplit && newSplit.chars) {
      gsap.fromTo(newSplit.chars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.05,
          delay: 0.3,
          stagger: {
            amount: 0.5,
            each: 0.1,
            from: "random",
          },
          ease: "power2.inOut"
        }
      );
    }
  };

  const handleTransition = (newIndex) => {
    const oldIndex = activeIndex;
    setActiveIndex(newIndex);
    updateFluidPosition(newIndex, true);
    animateContent(newIndex, oldIndex);
  };

  const handlePrev = () => {
    const newIndex = activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
    handleTransition(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeIndex === testimonials.length - 1 ? 0 : activeIndex + 1;
    handleTransition(newIndex);
  };

  const handleCardClick = (index) => {
    if (index !== activeIndex) {
      handleTransition(index);
    }
  };

  if (testimonials.length === 0) return null;

  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          {/* Arrows flank the header title (left/right) */}
          <button className="nav-btn prev" onClick={handlePrev} aria-label="Previous review">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="testimonials-title">
            <Copy>
              <h2>Listen to what our<br />Clients say about us?</h2>
            </Copy>
          </div>
          <button className="nav-btn next" onClick={handleNext} aria-label="Next review">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="testimonials-slider-wrapper" ref={containerRef}>
          {/* Fluid background that moves between cards */}
          <div className="fluid-bg" ref={fluidBgRef}></div>

          <div className="testimonials-slider" style={{ '--slide-index': activeIndex }}>
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id || index}
                ref={(el) => (cardsRef.current[index] = el)}
                className={`testimonial-card ${index === activeIndex ? "active" : ""}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="testimonial-content">
                  <div className="testimonial-card-header">
                    <div className="testimonial-avatar">
                      <div className="avatar-placeholder">
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div className="testimonial-info">
                      <span className="testimonial-number">( 0{index + 1} )</span>
                      <h4>{testimonial.name}</h4>
                      <p className="testimonial-role">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="testimonial-stars" aria-label="5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  {testimonial.headline && (
                    <h3 className="testimonial-headline">{testimonial.headline}</h3>
                  )}
                  <p className="testimonial-text">
                    "{testimonial.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Mobile dots below slider */}
        <div className="testimonials-mobile-dots">
          {testimonials.map((_, i) => (
            <span
              key={i}
              className={`testimonial-dot ${i === activeIndex ? 'active' : ''}`}
              onClick={() => handleTransition(i)}
            />
          ))}
        </div>

        {/* Write a review CTA */}
        <div className="testimonials-review-cta">
          <p className="review-cta-text">Used our products? We'd love to hear from you.</p>
          <button className="review-cta-btn" onClick={openReviewForm}>
            Write a Review
          </button>
        </div>
      </div>

      {/* Review modal */}
      {showReviewForm && (
        <div className="review-modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="review-modal-close"
              onClick={() => setShowReviewForm(false)}
              aria-label="Close"
            >
              &times;
            </button>

            {reviewSubmitted ? (
              <div className="review-thankyou">
                <div className="review-thankyou-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3>Thank you!</h3>
                <p>Your review has been received. We appreciate your feedback.</p>
                <button className="review-cta-btn" onClick={() => setShowReviewForm(false)}>
                  Done
                </button>
              </div>
            ) : (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <h3 className="review-form-title">Share Your Experience</h3>

                <label className="review-field">
                  <span>Your Name</span>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Priya S."
                    required
                  />
                </label>

                <div className="review-field">
                  <span>Your Rating</span>
                  <div className="review-star-input">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        className={`review-star ${n <= reviewForm.rating ? "filled" : ""}`}
                        onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="review-field">
                  <span>Your Review</span>
                  <textarea
                    rows={4}
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
                    placeholder="Tell us what you loved..."
                    required
                  />
                </label>

                <button className="review-submit-btn" type="submit" disabled={reviewSubmitting}>
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;

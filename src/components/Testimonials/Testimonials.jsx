"use client";
import "./Testimonials.css";
import { useState, useRef, useEffect } from "react";
import Copy from "../Copy/Copy";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { testimonialApi } from "@/lib/endpoints";

gsap.registerPlugin(SplitText);

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardsRef = useRef([]);
  const fluidBgRef = useRef(null);
  const containerRef = useRef(null);
  const headlineSplitsRef = useRef([]);
  const initRef = useRef(false);

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
      .catch(() => {});
  }, []);

  // Initialize animations after testimonials are loaded
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Set initial position of fluid background
    updateFluidPosition(activeIndex, false);

    // Initialize SplitText for all headlines
    cardsRef.current.forEach((card, i) => {
      if (card) {
        const headline = card.querySelector('.testimonial-headline');
        if (headline && !headlineSplitsRef.current[i]) {
          const split = SplitText.create(headline, {
            type: "words,chars",
          });
          headlineSplitsRef.current[i] = split;

          if (i === activeIndex) {
            gsap.set(split.chars, { opacity: 1 });
          } else {
            gsap.set(split.chars, { opacity: 0 });
          }
        }
      }
    });

    return () => {
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
          <div className="testimonials-title">
            <Copy>
              <h2>Listen to what our<br />Clients say about us?</h2>
            </Copy>
          </div>
          <div className="testimonials-nav">
            <button className="nav-btn prev" onClick={handlePrev} aria-label="Previous testimonial">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="nav-btn next" onClick={handleNext} aria-label="Next testimonial">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
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
                  <h3 className="testimonial-headline">{testimonial.headline}</h3>
                  <div className="testimonial-images">
                    <div className="testimonial-image-card">
                      <span className="image-label">Before</span>
                      <img src={testimonial.beforeImage} alt={`${testimonial.name} before`} />
                    </div>
                    <div className="testimonial-image-card">
                      <span className="image-label">After</span>
                      <img src={testimonial.afterImage} alt={`${testimonial.name} after`} />
                    </div>
                  </div>
                  <p className="testimonial-text">
                    "{testimonial.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Mobile navigation - outside slider wrapper so it doesn't move */}
        <div className="testimonials-mobile-nav">
          <button className="nav-btn prev" onClick={handlePrev} aria-label="Previous testimonial">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="testimonials-dots">
            {testimonials.map((_, i) => (
              <span
                key={i}
                className={`testimonial-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => handleTransition(i)}
              />
            ))}
          </div>
          <button className="nav-btn next" onClick={handleNext} aria-label="Next testimonial">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;

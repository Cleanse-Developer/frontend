"use client";
import "./Testimonials.css";
import { useState, useRef, useEffect } from "react";
import Copy from "../Copy/Copy";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const testimonials = [
  {
    id: 1,
    name: "Priya S.",
    role: "Verified Buyer",
    headline: "Amazing Results!",
    text: "I've always struggled to find a skincare routine that matches my sensitive skin. Cleanse Ayurveda's products have been a revelation! The natural ingredients are gentle yet effective, and I've seen visible improvements in just two weeks.",
    beforeImage: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=200&h=250&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=250&fit=crop",
  },
  {
    id: 2,
    name: "Ananya M.",
    role: "Verified Buyer",
    headline: "Simply Perfect!",
    text: "The natural ingredients really make a difference. My skin has never felt so nourished and healthy. I love that everything is rooted in Ayurvedic traditions. Highly recommend to anyone looking for clean beauty!",
    beforeImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=250&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=200&h=250&fit=crop",
  },
  {
    id: 3,
    name: "Meera R.",
    role: "Verified Buyer",
    headline: "Life-Changing!",
    text: "I struggled with dull skin for years and tried everything under the sun. Cleanse Ayurveda's Sacred Glow serum completely transformed my skin! Within weeks, I noticed a radiant glow, and my skin felt so much healthier. I can't thank Cleanse enough for giving me my confidence back.",
    beforeImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=250&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1592621385612-4d7129426394?w=200&h=250&fit=crop",
  },
  {
    id: 4,
    name: "Kavya D.",
    role: "Verified Buyer",
    headline: "Pure & Effective!",
    text: "The Ayurvedic approach to skincare is exactly what I was looking for. Pure, natural, and incredibly effective. My morning routine has become a sacred ritual thanks to these beautiful products.",
    beforeImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=250&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=250&fit=crop",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardsRef = useRef([]);
  const fluidBgRef = useRef(null);
  const containerRef = useRef(null);
  const headlineSplitsRef = useRef([]);

  useEffect(() => {
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
  }, []);

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

  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <div className="testimonials-label">
            <Copy type="flicker">
              <p>( TESTIMONIALS )</p>
            </Copy>
          </div>
          <div className="testimonials-title">
            <Copy>
              <h2>What Our<br />Customers Say</h2>
            </Copy>
            <Copy>
              <p className="testimonials-desc">
                Ancient Ayurvedic wisdom meets modern skincare,<br />
                trusted by thousands for radiant, healthy skin.
              </p>
            </Copy>
          </div>
          <div className="testimonials-nav">
            <button className="nav-btn prev" onClick={handlePrev} aria-label="Previous testimonial">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="nav-btn next" onClick={handleNext} aria-label="Next testimonial">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
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
                key={testimonial.id}
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
                      <span className="testimonial-number">( 0{testimonial.id} )</span>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="testimonials-cta">
          <div className="testimonials-cta-content">
            <Copy>
              <h3>Do you have<br />any questions?</h3>
            </Copy>
            <Copy>
              <p>Feel free to send us your questions or request a free consultation.</p>
            </Copy>
            <div className="btn testimonials-btn">
              <Copy type="flicker">
                <a href="/contact">Get in Touch</a>
              </Copy>
            </div>
          </div>
          <div className="testimonials-cta-note">
            <span>/</span>
            <p>Our products are crafted with pure, natural ingredients for your skin's wellness.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

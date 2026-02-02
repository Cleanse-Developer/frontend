"use client";
import { useEffect, useRef } from "react";
import "./LeafSpread.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LeafSpread = ({ delay = 0, count = 30, triggerOnScroll = false, triggerElement = null }) => {
  const containerRef = useRef(null);

  // Different realistic leaf shapes (COLOR will be replaced dynamically)
  const getLeafShape = (color) => [
    // Tulsi/Basil leaf
    `<path d="M25 4C25 4 12 12 10 25C8 38 18 46 25 48C32 46 42 38 40 25C38 12 25 4 25 4Z" fill="${color}"/>
     <path d="M25 10V44" stroke="rgba(0,0,0,0.2)" stroke-width="0.8"/>
     <path d="M25 18C21 20 18 24 17 30" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
     <path d="M25 18C29 20 32 24 33 30" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
     <path d="M25 26C22 27 20 30 19 34" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
     <path d="M25 26C28 27 30 30 31 34" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>`,

    // Neem leaf (elongated)
    `<path d="M25 2C25 2 15 8 12 20C9 32 15 42 25 48C35 42 41 32 38 20C35 8 25 2 25 2Z" fill="${color}"/>
     <path d="M25 6V45" stroke="rgba(0,0,0,0.2)" stroke-width="0.7"/>
     <path d="M25 14L18 22" stroke="rgba(0,0,0,0.12)" stroke-width="0.4"/>
     <path d="M25 14L32 22" stroke="rgba(0,0,0,0.12)" stroke-width="0.4"/>
     <path d="M25 22L17 32" stroke="rgba(0,0,0,0.12)" stroke-width="0.4"/>
     <path d="M25 22L33 32" stroke="rgba(0,0,0,0.12)" stroke-width="0.4"/>
     <path d="M25 32L19 40" stroke="rgba(0,0,0,0.12)" stroke-width="0.4"/>
     <path d="M25 32L31 40" stroke="rgba(0,0,0,0.12)" stroke-width="0.4"/>`,

    // Round leaf (like money plant)
    `<path d="M25 6C25 6 8 18 8 30C8 42 16 46 25 48C34 46 42 42 42 30C42 18 25 6 25 6Z" fill="${color}"/>
     <path d="M25 10V45" stroke="rgba(0,0,0,0.18)" stroke-width="0.8"/>
     <path d="M25 20C19 23 14 28 13 35" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
     <path d="M25 20C31 23 36 28 37 35" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>`,

    // Pointed leaf (like mango)
    `<path d="M25 2C25 2 10 15 10 28C10 41 20 47 25 49C30 47 40 41 40 28C40 15 25 2 25 2Z" fill="${color}"/>
     <path d="M25 5V46" stroke="rgba(0,0,0,0.2)" stroke-width="0.6"/>
     <path d="M25 15L16 26" stroke="rgba(0,0,0,0.1)" stroke-width="0.4"/>
     <path d="M25 15L34 26" stroke="rgba(0,0,0,0.1)" stroke-width="0.4"/>
     <path d="M25 25L14 38" stroke="rgba(0,0,0,0.1)" stroke-width="0.4"/>
     <path d="M25 25L36 38" stroke="rgba(0,0,0,0.1)" stroke-width="0.4"/>`,

    // Small oval leaf
    `<path d="M25 8C25 8 14 16 14 28C14 40 22 45 25 46C28 45 36 40 36 28C36 16 25 8 25 8Z" fill="${color}"/>
     <path d="M25 11V43" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
     <path d="M25 20C21 23 18 28 18 34" stroke="rgba(0,0,0,0.1)" stroke-width="0.4"/>
     <path d="M25 20C29 23 32 28 32 34" stroke="rgba(0,0,0,0.1)" stroke-width="0.4"/>`,
  ];

  // Natural green color palette
  const leafColors = [
    { main: "#2D5A27", highlight: "#3D7A37" }, // Deep forest green
    { main: "#3E6B35", highlight: "#4E8B45" }, // Medium green
    { main: "#4A7C42", highlight: "#5A9C52" }, // Fresh green
    { main: "#567D46", highlight: "#669D56" }, // Sage green
    { main: "#3B5F34", highlight: "#4B7F44" }, // Dark olive green
    { main: "#456B3E", highlight: "#558B4E" }, // Moss green
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const leaves = containerRef.current.querySelectorAll(".leaf");
    let scrollTriggerInstance = null;

    // Initial state - all leaves at center, invisible
    gsap.set(leaves, {
      x: 0,
      y: 0,
      scale: 0,
      rotation: () => Math.random() * 360,
      opacity: 0,
    });

    const animateLeaves = () => {
      // Spread animation with realistic physics
      leaves.forEach((leaf, i) => {
        const angle = (Math.random() * Math.PI * 2);
        const distance = 250 + Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.8);
        const finalX = Math.cos(angle) * distance;
        const finalY = Math.sin(angle) * distance * 0.8;
        const size = 0.4 + Math.random() * 0.8;
        const rotationEnd = (Math.random() - 0.5) * 720;

        // Main spread animation
        gsap.to(leaf, {
          x: finalX,
          y: finalY,
          scale: size,
          rotation: rotationEnd,
          opacity: 0.7 + Math.random() * 0.3,
          duration: 1.8 + Math.random() * 0.8,
          ease: "power2.out",
          delay: i * 0.03,
        });

        // Continuous gentle floating
        gsap.to(leaf, {
          y: `+=${15 + Math.random() * 25}`,
          x: `+=${(Math.random() - 0.5) * 15}`,
          rotation: `+=${(Math.random() - 0.5) * 15}`,
          duration: 2.5 + Math.random() * 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 2 + Math.random() * 0.5,
        });
      });
    };

    if (triggerOnScroll) {
      // Use ScrollTrigger
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: triggerElement || containerRef.current,
        start: "top 80%",
        onEnter: animateLeaves,
        once: true,
      });
    } else {
      // Animate immediately with delay
      setTimeout(animateLeaves, delay * 1000);
    }

    return () => {
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }
    };
  }, [delay, triggerOnScroll, triggerElement]);

  return (
    <div className="leaf-spread" ref={containerRef}>
      {Array.from({ length: count }).map((_, i) => {
        const colorIndex = i % leafColors.length;
        const color = leafColors[colorIndex];
        const leafShapes = getLeafShape(color.main);
        const shapeIndex = i % leafShapes.length;
        // Deterministic depth based on index to avoid hydration mismatch
        const zIndex = i % 3;
        const blur = zIndex === 0 ? 2 : zIndex === 2 ? 1 : 0;

        return (
          <div
            key={i}
            className={`leaf leaf-depth-${zIndex}`}
            style={{
              filter: blur > 0 ? `blur(${blur}px)` : 'none',
            }}
          >
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g dangerouslySetInnerHTML={{ __html: leafShapes[shapeIndex] }} />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export default LeafSpread;

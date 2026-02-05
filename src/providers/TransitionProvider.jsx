"use client";
import { useRef, useEffect } from "react";

import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";

const BLOCK_COUNT = 10;

export default function TransitionProvider({ children }) {
  const transitionGridRef = useRef(null);
  const blocksRef = useRef([]);

  const createTransitionGrid = () => {
    if (!transitionGridRef.current) return;

    const container = transitionGridRef.current;
    container.innerHTML = "";
    blocksRef.current = [];

    const blockWidth = window.innerWidth / BLOCK_COUNT;

    for (let i = 0; i < BLOCK_COUNT; i++) {
      const block = document.createElement("div");
      block.className = "transition-block";
      block.style.cssText = `
        width: ${blockWidth + 5}px;
        height: 100%;
        left: ${i * blockWidth}px;
        margin-left: -2.5px;
      `;
      container.appendChild(block);
      blocksRef.current.push(block);
    }

    gsap.set(blocksRef.current, { scaleX: 0 });
  };

  useEffect(() => {
    createTransitionGrid();
    window.addEventListener("resize", createTransitionGrid);
    return () => window.removeEventListener("resize", createTransitionGrid);
  }, []);

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        window.dispatchEvent(new CustomEvent("page-transition", { detail: { active: true } }));
        gsap.set(blocksRef.current, { scaleX: 0, transformOrigin: "left" });
        const tween = gsap.to(blocksRef.current, {
          scaleX: 1,
          duration: 0.5,
          ease: "power3.out",
          stagger: { amount: 0.3, from: "start" },
          onComplete: next,
        });
        return () => tween.kill();
      }}
      enter={(next) => {
        gsap.set(blocksRef.current, { scaleX: 1, transformOrigin: "right" });
        const tween = gsap.to(blocksRef.current, {
          scaleX: 0,
          duration: 0.5,
          delay: 0.5,
          ease: "power3.out",
          stagger: { amount: 0.3, from: "start" },
          onComplete: () => {
            window.dispatchEvent(new CustomEvent("page-transition", { detail: { active: false } }));
            next();
          },
        });
        return () => tween.kill();
      }}
    >
      <div ref={transitionGridRef} className="transition-grid" />
      {children}
    </TransitionRouter>
  );
}

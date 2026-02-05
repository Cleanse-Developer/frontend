"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const HoverWord = ({ word, imageSrc, imageAlt = "Hover image", popupPosition = "bottom" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  // Close on tap outside (mobile)
  useEffect(() => {
    if (!isHovered) return;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsHovered(false);
      }
    };
    document.addEventListener("touchstart", handleOutside);
    return () => document.removeEventListener("touchstart", handleOutside);
  }, [isHovered]);

  return (
    <span
      ref={containerRef}
      className="hover-word-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={(e) => {
        e.stopPropagation();
        setIsHovered((prev) => !prev);
      }}
    >
      <span className={`hover-word-text ${isHovered ? "hovered" : ""}`}>
        {word}
      </span>
      <AnimatePresence>
        {isHovered && (
          <motion.span
            className={`hover-word-image-wrapper ${popupPosition === "top" ? "popup-top" : ""}`}
            initial={{ opacity: 0, scale: 0.8, y: popupPosition === "top" ? -15 : 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: popupPosition === "top" ? -10 : 10 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={140}
              height={70}
              className="hover-word-image"
              priority
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

export default HoverWord;

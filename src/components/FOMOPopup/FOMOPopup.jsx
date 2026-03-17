"use client";
import "./FOMOPopup.css";
import { useState, useEffect, useRef } from "react";
import { socialProofApi } from "@/lib/endpoints";

const FALLBACK_MESSAGES = [
  { name: "Priya", location: "Mumbai", product: "Kumkumadi Serum", time: "2 minutes ago" },
  { name: "Ananya", location: "Delhi", product: "Rose Face Mist", time: "5 minutes ago" },
  { name: "Sneha", location: "Bangalore", product: "Neem Face Wash", time: "8 minutes ago" },
  { name: "Riya", location: "Chennai", product: "Sandalwood Cream", time: "12 minutes ago" },
  { name: "Kavya", location: "Pune", product: "Turmeric Mask", time: "15 minutes ago" },
  { name: "Meera", location: "Hyderabad", product: "Aloe Gel", time: "18 minutes ago" },
  { name: "Aisha", location: "Kolkata", product: "Saffron Serum", time: "3 minutes ago" },
  { name: "Divya", location: "Jaipur", product: "Jasmine Oil", time: "7 minutes ago" },
];

const FOMOPopup = ({ isActive }) => {
  const [currentMessage, setCurrentMessage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const messageIndexRef = useRef(0);
  const messagesRef = useRef(FALLBACK_MESSAGES);

  // Fetch real purchase data on mount
  useEffect(() => {
    socialProofApi.getRecentPurchases(10)
      .then((data) => {
        const purchases = data.purchases || [];
        if (purchases.length > 0) {
          messagesRef.current = purchases;
        }
      })
      .catch(() => { /* keep fallbacks */ });
  }, []);

  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const showNextMessage = () => {
      const messages = messagesRef.current;
      const message = messages[messageIndexRef.current % messages.length];
      messageIndexRef.current = (messageIndexRef.current + 1) % messages.length;

      setCurrentMessage(message);
      setIsVisible(true);

      // Hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false);

        // Schedule next popup with random delay between 3-6 seconds
        const nextDelay = Math.floor(Math.random() * 3000) + 3000;
        timeoutRef.current = setTimeout(showNextMessage, nextDelay);
      }, 4000);
    };

    // Start first popup after 2 seconds
    timeoutRef.current = setTimeout(showNextMessage, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!currentMessage) return null;

  return (
    <div className={`fomo-popup ${isVisible ? "visible" : ""}`}>
      <div className="fomo-content">
        <div className="fomo-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6h12l1.5 12H4.5L6 6z" />
            <path d="M9 6V4a3 3 0 016 0v2" />
          </svg>
        </div>
        <div className="fomo-text">
          <span className="fomo-message"><strong>{currentMessage.name}</strong> bought</span>
          <span className="fomo-product">{currentMessage.product}</span>
          <span className="fomo-time">• {currentMessage.time}</span>
        </div>
        <button className="fomo-close" onClick={handleClose}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FOMOPopup;

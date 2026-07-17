"use client";
import "./ChatSupport.css";
import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";

const ChatSupport = () => {
  // Use the SAME contact number as the footer so they always match.
  const settings = useSettings();
  const supportPhone = settings.cmsFooter?.contact?.phone || "+91 80000 00000";
  // Same source the footer uses; falls back to the real contact address rather
  // than the old support@cleanse.com placeholder.
  const supportEmail = settings.cmsFooter?.contact?.email || "hello@cleanseayurveda.com";
  const whatsappNumber = supportPhone.replace(/[^\d]/g, "");

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! Welcome to Cleanse. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const messagesContainerRef = useRef(null);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Prevent scroll from bubbling to website
  const handleWheel = (e) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // If scrolling up at top or down at bottom, prevent default
    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  const quickReplies = [
    "Track my order",
    "Product recommendations",
    "Return policy",
    "Talk to support",
    "Chat on WhatsApp"
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages([...messages, { type: "user", text: inputValue }]);
    setInputValue("");

    // Simulated bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: "bot",
        text: `Thank you for your message! Our team will get back to you shortly. For immediate assistance, you can also email us at ${supportEmail}`
      }]);
    }, 1000);
  };

  const handleQuickReply = (reply) => {
    if (reply === "Chat on WhatsApp") {
      window.open(`https://wa.me/${whatsappNumber}`, "_blank", "noopener,noreferrer");
      return;
    }

    setMessages([...messages, { type: "user", text: reply }]);

    setTimeout(() => {
      let response = "";
      switch (reply) {
        case "Track my order":
          response = "To track your order, please provide your order ID or the email used during purchase.";
          break;
        case "Product recommendations":
          response = "I'd love to help! What's your primary skin concern? (e.g., acne, dryness, anti-aging, pigmentation)";
          break;
        case "Return policy":
          response = "We offer a 30-day return policy for unused products in original packaging. Would you like to initiate a return?";
          break;
        case "Talk to support":
          response = `Our support team is available Mon-Sat, 9 AM - 6 PM IST. You can also email ${supportEmail} or call ${supportPhone}.`;
          break;
        default:
          response = "How can I assist you further?";
      }
      setMessages(prev => [...prev, { type: "bot", text: response }]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className={`chat-support-btn ${isOpen ? "hidden" : ""}`}
        onClick={() => setIsOpen(true)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={`chat-window ${isOpen ? "open" : ""}`}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <img src="/cleanse-monogram.svg" alt="Cleanse" />
            </div>
            <div>
              <h4>Cleanse Support</h4>
              <span className="chat-status">
                <span className="status-dot"></span>
                Online
              </span>
            </div>
          </div>
          <button className="chat-close" onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          className="chat-messages"
          ref={messagesContainerRef}
          onWheel={handleWheel}
        >
          {messages.map((message, index) => (
            <div key={index} className={`chat-message ${message.type}`}>
              {message.type === "bot" && (
                <div className="message-avatar">
                  <img src="/cleanse-monogram.svg" alt="Bot" />
                </div>
              )}
              <div className="message-bubble">
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-quick-replies">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              className={`quick-reply-btn${reply === "Chat on WhatsApp" ? " whatsapp" : ""}`}
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="chat-send" onClick={handleSend}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22,2 15,22 11,13 2,9" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatSupport;

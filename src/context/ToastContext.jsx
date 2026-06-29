"use client";
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
  };

  // Brand palette: warm cream card, earthy accent bar, deep-brown text — matches
  // the Ayurvedic UI instead of the generic green/red/grey defaults.
  const ACCENTS = {
    success: "#5c7a52", // sage green
    error: "#b3503f", // terracotta
    info: "#663532", // brand brown
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}>
          {toasts.map((t) => {
            const accent = ACCENTS[t.type] || ACCENTS.success;
            return (
              <div
                key={t.id}
                role="status"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.8rem 1.1rem",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  lineHeight: 1.4,
                  fontFamily: "var(--font-body, sans-serif)",
                  color: "#3a2320",
                  background: "#fdfbf7",
                  border: "1px solid rgba(102,53,50,0.12)",
                  borderLeft: `3px solid ${accent}`,
                  boxShadow: "0 8px 24px rgba(40,24,22,0.12)",
                  animation: "toastIn 0.3s cubic-bezier(0.22,0.61,0.36,1)",
                  maxWidth: "340px",
                }}
              >
                <span style={{
                  flexShrink: 0,
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: accent,
                }} />
                <span>{t.message}</span>
              </div>
            );
          })}
        </div>
      )}
      <style jsx global>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return { success: () => {}, error: () => {}, info: () => {} };
  }
  return context;
};

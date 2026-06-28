"use client";
import { useEffect } from "react";
import Link from "next/link";

// Route-level error boundary for /cart. Contains any unexpected render error to
// this route (rest of the app stays intact) and offers a retry.
export default function CartError({ error, reset }) {
  useEffect(() => {
    console.error("Cart route error:", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", marginBottom: "0.75rem", color: "#333" }}>
        Something went wrong
      </h2>
      <p style={{ color: "#666", marginBottom: "1.5rem", maxWidth: "400px" }}>
        We couldn&apos;t load your bag right now. Please try again.
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#663532",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Try again
        </button>
        <Link
          href="/wardrobe"
          style={{
            padding: "0.75rem 1.5rem",
            background: "transparent",
            color: "#663532",
            border: "1px solid #663532",
            borderRadius: "4px",
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

"use client";
import { useEffect } from "react";
import Link from "next/link";

// Route-level error boundary for /checkout. Contains any unexpected render error
// to this route and offers a retry; the cart itself is preserved server-side.
export default function CheckoutError({ error, reset }) {
  useEffect(() => {
    console.error("Checkout route error:", error);
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
        We couldn&apos;t load checkout right now. Your bag is safe — please try
        again.
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
          href="/cart"
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
          Back to Bag
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Homepage error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "8px" }}>
        Something went wrong
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
        {error?.message || "An unexpected error occurred"}
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-primary"
        style={{ maxWidth: "200px" }}
      >
        Try again
      </button>
    </div>
  );
}

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2 style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>Algo deu errado</h2>
      <p style={{ color: "#666", marginBottom: "1rem" }}>Não foi possível carregar esta página.</p>
      <button
        type="button"
        onClick={() => reset()}
        style={{
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}

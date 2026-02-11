"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "480px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Algo deu errado</h1>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          O aplicativo encontrou um erro. Se o problema continuar, verifique as variáveis de ambiente (por exemplo DATABASE_URL) no painel da Vercel.
        </p>
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
      </body>
    </html>
  );
}
